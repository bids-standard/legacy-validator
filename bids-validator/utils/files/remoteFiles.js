import { S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'
import cp from 'child_process'
import Issue from '../issues'
import pako from 'pako'
import isNode from '../isNode'

/**
 * Remote Files
 *
 * Helper functions for checking for and using remote file paths
 *
 */

const remoteFiles = {
  // Initiates access of a remote file from git-annex remote
  // Get remotes info the call to try successive remotes
  // Called by testFile
  getAnnexedFile: function (file, dir, limit, callback) {
    // Build config object
    const config = {
      file: file,
      dir: dir,
    }
    if (limit) config.limit = limit
    config.remotesInfo = this.getRemotesInfo(dir, file)

    // try all the special git-annex remotes, and exit if there is an issue (reading / fetching files)
    // if all remotes fail, throw issue code 97
    config.remotesInfo.map((remote, idx) => {
      return this.tryRemote(remote, config)
        .then((data) => callback(null, null, data))
        .catch((err) => {
          if (err.code) {
            return callback(err, null, null)
          }
          if (idx == config.remotesInfo.length) {
            return callback(
              new Issue({ code: 98, file: config.file }),
              null,
              null,
            )
          }
        })
    })
  },

  // Try to access file from a remote
  tryRemote: function (remote, config) {
    // Get current remote
    config.s3Params = this.getSingleRemoteInfo(config.dir, remote.remoteUuid)
    const dir = config.dir.endsWith('/') ? config.dir.slice(0, -1) : config.dir
    const datasetName = dir.split('/')[dir.split('/').length - 1]
    const key = datasetName + config.file.relativePath
    // Add additional parameters
    config.s3Params['Key'] = key
    config.s3Params['VersionId'] = remote.versionId
    return this.accessRemoteFile(config)
  },

  // Download a remote file from its path
  accessRemoteFile: function (config) {
    if (config.limit) config.s3Params['Range'] = 'bytes=0-' + config.limit
    return new Promise((resolve, reject) => {
      this.constructAwsRequest(config)
        .then((buffer) => {
          if (config.file.name.endsWith('.gz')) {
            this.extractGzipBuffer(buffer, config)
              .then((data) => resolve(data))
              .catch((err) => reject(err))
          } else {
            resolve(buffer)
          }
        })
        .catch(reject)
    })
  },

  constructAwsRequest: function (config) {
    const hasCreds = isNode
      ? Object.keys(process.env).indexOf('AWS_ACCESS_KEY_ID') > -1
      : false
    if (hasCreds) {
      const s3 = new S3Client()
      return s3.getObject(config.s3Params).then((data) => data.Body)
    } else {
      let url = this.constructAwsUrl(config)
      return fetch(url).then((resp) => {
        if (resp.ok) {
          return resp.buffer()
        } else {
          return Promise.reject(
            new Error(
              `HTTP response failed - ${resp.status} - ${resp.statusText}`,
            ),
          )
        }
      })
    }
  },

  constructAwsUrl: function (config) {
    // bucket + key url
    let url = `http://s3.amazonaws.com/${config.s3Params.Bucket}/${config.s3Params.Key}`

    // add version to url, if exists
    url = config.s3Params.VersionId
      ? url + '?VersionId=' + config.s3Params.VersionId
      : url

    // add range to url, if exists
    url = config.s3Params.Range ? url + '?Range=' + config.s3Params.Range : url
    return url
  },

  extractGzipBuffer: function (buffer, config) {
    return new Promise((resolve, reject) => {
      try {
        resolve(pako.inflate(buffer))
      } catch (e) {
        return reject(new Issue({ code: 28, file: config.file }))
      }
    })
  },

  // Function for calling local git-annex
  callGitAnnex: function (cmd, cwd) {
    const stream = cp.execSync(cmd, {
      shell: true,
      cwd,
    })
    return stream.toString()
  },

  // Ask git-annex for more information about a file
  getRemotesInfo: function (dir, file) {
    // Remove leading slash from  relativePath
    const relativePath =
      file.relativePath && file.relativePath.startsWith('/')
        ? file.relativePath.substring(1)
        : file.relativePath
    const lookupkey = this.getLookupKey(relativePath, dir)
    const hashDirLower = this.getHashDirLower(lookupkey, dir)
    const metadata = this.getRemoteMetadata(hashDirLower, lookupkey, dir)
    const remotesInfo = this.processRemoteMetadata(metadata)
    return remotesInfo
  },

  // get the key for a particular file's relative path
  getLookupKey: function (relativePath, dir) {
    const lookupKeyCmd = `git-annex lookupkey ${relativePath}`
    return this.callGitAnnex(lookupKeyCmd, dir).trim()
  },

  // get hashdirlower property from the git-annex examinekey command
  getHashDirLower: function (lookupkey, dir) {
    try {
      const examineKeyCmd = `git-annex examinekey --json ${lookupkey}`
      const examineKey = JSON.parse(this.callGitAnnex(examineKeyCmd, dir))
      return examineKey.hashdirlower
    } catch (e) {
      return null
    }
  },

  // get the remote metadata log content from git show command
  getRemoteMetadata: function (hashDirLower, lookupkey, dir) {
    const gitShowCmd = `git show git-annex:${hashDirLower}${lookupkey}.log.rmet`
    return this.callGitAnnex(gitShowCmd, dir)
  },

  // Get info from a given git-annex remote
  getSingleRemoteInfo: function (dir, uuid) {
    const infoCmd = `cd ${dir}
    git-annex info ${uuid}`
    const resp = this.callGitAnnex(infoCmd)
    return this.getRemoteBucket(resp)
  },

  // Obtain bucket field from git-annex info query
  getRemoteBucket: function (resp) {
    const params = {
      Bucket: null,
    }
    for (let line of resp.split('\n')) {
      if (line.includes('bucket: ')) {
        params.Bucket = line.split(': ')[1]
      }
    }
    return params
  },

  // Manipulate the response from git-annex lookupkey query
  processRemoteMetadata: function (resp) {
    const remotesInfo = []
    const lines = resp.split('\n')
    lines.map((line) => {
      const splitSpace = line.split(' ')
      if (splitSpace.length == 3) {
        const fileInfo = splitSpace[2].split('#')
        const timestamp = splitSpace[0]
        const annexInfo = splitSpace[1].split(':')
        if (fileInfo.length == 2 && annexInfo.length == 2) {
          const remoteUuid = annexInfo[0]
          const fileName = fileInfo[1]
          const versionId = fileInfo[0].substring(1)
          const remoteInfo = { timestamp, remoteUuid, fileName, versionId }
          remotesInfo.push(remoteInfo)
        }
      }
    })
    return remotesInfo
  },
  // Check if a local directory is a git-annex repo
  isGitAnnex: function (path) {
    if (isNode) return fs.existsSync(path + '/.git/annex')
    return false
  },
}

export default remoteFiles
