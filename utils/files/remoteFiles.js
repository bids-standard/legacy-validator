const AWS = require('aws-sdk')
var fs = require('fs')
const { spawnSync } = require('child_process')
const Issue = require('../../utils/issues').Issue
const zlib = require('zlib')
const s3 = new AWS.S3()

/**
 * Remote Files
 *
 * Helper functions for checking for and using remote file paths
 *
 */

const remoteFiles = {
  // Initiaties access of a remote file from git-annex remote
  // Get remotes info the call to try successive remotes
  // Called by testFile
  getAnnexedFile: function(file, dir, callback, limit) {
    // Build config object
    const config = {
      file: file,
      dir: dir,
      callback: callback,
    }
    if (limit) config.limit = limit
    config.remotesInfo = this.getRemotesInfo(dir, file)
    config.remoteCount = config.remotesInfo.length
    // Call recursive function to try remotes
    this.tryRemotes(config)
  },

  // Try successive remotes to access file
  tryRemotes: function(config) {
    // Keep track of iterations
    if (!config.i) config.i = 0
    // Increment last value of i if this isn't the first call
    if (config.i != 0) config.i++
    if (config.i == config.remoteCount - 1) config.last = true
    // Get current remote
    config.remote = config.remotesInfo[config.i]
    config.s3Params = this.getSingleRemoteInfo(
      config.dir,
      config.remote.remoteUuid,
    )
    const dir = config.dir.endsWith('/') ? config.dir.slice(0, -1) : config.dir
    const datasetName = dir.split('/')[dir.split('/').length - 1]
    const key = datasetName + config.file.relativePath
    // Add additonal parameters
    config.s3Params['Key'] = key
    config.s3Params['VersionId'] = config.remote.versionId
    this.accessRemoteFile(config)
  },
  // Function for calling local git-annex
  callGitAnnex: function(cmd) {
    const stream = spawnSync(cmd, {
      shell: true,
    })
    return stream.stdout.toString()
  },

  // Download a remote file from its path
  accessRemoteFile: function(config) {
    if (config.limit) config.s3Params['Range'] = 'bytes=0-' + config.limit
    s3.getObject(config.s3Params)
      .promise()
      .then(data => {
        let buffer = data.Body
        if (config.file.name.endsWith('.gz')) {
          this.extractGzipBuffer(buffer, config.callback)
        } else {
          config.callback(null, null, buffer)
        }
      })
      .catch(() => {
        // Log an error if this is the last remote to try
        if (config.last) {
          config.callback(
            new Issue({ code: 97, file: config.file }),
            null,
            null,
          )
        } else {
          // Call to try next remote
          this.tryRemotes(config)
        }
      })
  },

  extractGzipBuffer: function(buffer, callback) {
    const decompressStream = zlib
      .createGunzip()
      .on('data', function(chunk) {
        callback(null, null, chunk)
        decompressStream.pause()
      })
      .on('error', function() {
        callback(new Issue({ code: 28, file: config.file }), null, null)
      })
    decompressStream.write(buffer)
  },

  // Ask git-annex for more information about a file
  getRemotesInfo: function(dir, file) {
    // Remove leading slash from  relativePath
    const relativePath = file.relativePath.startsWith('/')
      ? file.relativePath.substring(1)
      : file.relativePath
    const getRemoteCmd = `cd ${dir}
    git show git-annex:$(git-annex examinekey --json $(git-annex lookupkey ${relativePath}) | jq -r .hashdirlower)$(git-annex lookupkey ${relativePath}).log.rmet`
    const resp = this.callGitAnnex(getRemoteCmd)
    const remotesInfo = this.processGetRemoteResponse(resp)
    return remotesInfo
  },

  // Get info from a given git-annex remote
  getSingleRemoteInfo: function(dir, uuid) {
    const infoCmd = `cd ${dir}
    git-annex info ${uuid}
    `
    const resp = this.callGitAnnex(infoCmd)
    return this.processInfoQuery(resp)
  },
  // Manipulate the response from git-annex info query
  processInfoQuery: function(resp) {
    const params = {
      Bucket: null,
    }
    for (let line of resp.split('\n')) {
      if (line.includes('bucket:')) {
        params.Bucket = line.split(': ')[1]
      }
    }
    return params
  },
  // Manipulate the response from git-annex whereis query
  processGetRemoteResponse: function(resp) {
    const remotesInfo = []
    const lines = resp.split('\n')
    for (let line of lines) {
      if (line != '') {
        const splitSpace = line.split(' ')
        const remoteInfo = {
          timestamp: splitSpace[0],
          remoteUuid: splitSpace[1].split(':')[0],
          fileName: splitSpace[2].split('#')[1],
          versionId: splitSpace[2].split('#')[0].substring(1),
        }
        remotesInfo.push(remoteInfo)
      }
    }
    return remotesInfo
  },
  // Check if a local directory is a git-annex repo
  isGitAnnex: function(path) {
    return fs.existsSync(path + '/.git/annex')
  },
  // Parse JSON from string if it's valid, else return false
  safeParse: function(string) {
    try {
      return JSON.parse(string)
    } catch (e) {
      return false
    }
  },
}

module.exports = remoteFiles
