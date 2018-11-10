const assert = require('chai').assert
const remoteFiles = require('../remoteFiles')
const fs = require('fs')
const zlib = require('zlib')
const config = {
  s3Params: {
    Bucket: 'none',
  },
  file: {
    name: 'something',
  },
}

describe('remoteFiles', () => {
  beforeAll(() => {
    // fetch mock
    global.fetch = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ ok: true, buffer: () => 'buffer' }),
      )
  })

  beforeEach(() => {
    delete process.env.AWS_ACCESS_KEY_ID
  })

  describe('accessRemoteFile', () => {
    it('should return a promise', () => {
      const promise = remoteFiles.accessRemoteFile(config)
      expect(promise).toBeInstanceOf(Promise)
    })
    it('should return the response of constructAwsRequest if successful', () => {
      remoteFiles
        .accessRemoteFile(config)
        .then(res => expect(res).toBe('buffer'))
    })
    it('should return the issue of extractGzipBuffer if unzip is unsuccessful', done => {
      config.file.name = 'something.gz'
      remoteFiles.accessRemoteFile(config).catch(issue => {
        expect(issue).toHaveProperty('code')
        config.file.name = 'something'
        done()
      })
    })
    it(
      'should return the error of constructAwsRequest if unsuccessful',
      done => {
        process.env.AWS_ACCESS_KEY_ID = 12
        remoteFiles.accessRemoteFile(config).catch(err => {
          expect(err).toBeInstanceOf(Error)
          done()
        })
      },
      120000,
    )
  })

  describe('constructAwsRequest', () => {
    it('should return a fetch resolution promise when aws creds are not present', async () => {
      const response = remoteFiles.constructAwsRequest({
        s3Params: { Bucket: 'matters not' },
      })
      expect(response).toBeInstanceOf(Promise)
    })
    it('should return the buffer() property of the fetch response', async done => {
      remoteFiles
        .constructAwsRequest({
          s3Params: { Bucket: 'matters not' },
        })
        .then(data => {
          assert.equal(data, 'buffer')
          done()
        })
    })
    it(
      'should return a s3.getObject resolution promise when aws creds are present',
      done => {
        process.env.AWS_ACCESS_KEY_ID = 12
        config.s3Params.Key = 'this_is_not_valid'
        const response = remoteFiles.constructAwsRequest(config).catch(e => {
          expect(e)
          done()
        })
        expect(response).toBeInstanceOf(Promise)
      },
      120000,
    )
    it(
      'should throw an error when a bucket cannot be accessed',
      done => {
        process.env.AWS_ACCESS_KEY_ID = 12
        remoteFiles.constructAwsRequest(config).catch(e => {
          expect(e)
          done()
        })
      },
      120000,
    )
  })

  describe('extractGzipBuffer', () => {
    it('should extract proper gzip files', async () => {
      zlib.gzip('Some String', async (err, res) => {
        const gzip = await remoteFiles.extractGzipBuffer(res, {})
        expect(gzip).toBeInstanceOf(Buffer)
      })
    })
    it('should reject with an issue when gzip reading fails', async () => {
      try {
        const zip = 'bad data'
        await remoteFiles.extractGzipBuffer(zip, {})
      } catch (e) {
        expect(e).toHaveProperty('code')
        expect(e.code).toEqual(28)
      }
    })
  })

  describe('callGitAnnex', () => {
    it('should return the string result of execSync', () => {
      const resp = remoteFiles.callGitAnnex('echo test')
      expect(resp.trim()).toBe('test')
    })
  })

  describe('getRemotesInfo', () => {
    it('should return an empty array if callGitAnnex does not return contents of a metadata file', () => {
      remoteFiles.callGitAnnex = jest.fn()
      remoteFiles.callGitAnnex.mockReturnValue('bad_response')
      const remotesInfo = remoteFiles.getRemotesInfo('some_directory', {
        relativePath: 'some_file',
      })
      assert.lengthOf(remotesInfo, 0)
    })
    it('should return an empty array if file is not properly formatted', () => {
      const remotesInfo = remoteFiles.getRemotesInfo('some_directory', {})
      assert.lengthOf(remotesInfo, 0)
    })
    it('should return an empty array if directory is not properly formatted', () => {
      const remotesInfo = remoteFiles.getRemotesInfo('bad directory', {
        relativePath: 'some_path',
      })
      assert.lengthOf(remotesInfo, 0)
    })
    it('should return an array of remote objects if getRemoteData returns properly formatted remote metadata file', () => {
      remoteFiles.getRemoteMetadata = jest.fn()
      remoteFiles.getRemoteMetadata.mockReturnValue(
        'timestamp remoteuuid:commitinfo xversionId#fileName',
      )
      const remotesInfo = remoteFiles.getRemotesInfo('some_directory', {
        relativePath: 'some_file',
      })
      remoteFiles.getRemoteMetadata.mockRestore()
      assert.lengthOf(remotesInfo, 1)
    })
  })

  describe('getSingleRemoteInfo', () => {
    it('returns an object with null Bucket property if the response does not contain remote info', () => {
      remoteFiles.callGitAnnex = jest.fn()
      remoteFiles.callGitAnnex.mockReturnValue('bad_response')
      const singleRemoteInfo = remoteFiles.getSingleRemoteInfo(
        'some_dir',
        'some_uuid',
      )
      expect(singleRemoteInfo).toHaveProperty('Bucket')
      expect(singleRemoteInfo.Bucket).toBe(null)
    })
    it('returns an object with a Bucket property if callGitAnnex returns an object with the Bucket field', () => {
      remoteFiles.callGitAnnex = jest.fn()
      remoteFiles.callGitAnnex.mockReturnValue(
        'good_response\nbucket: such_bucket\nawesome_line',
      )
      const singleRemoteInfo = remoteFiles.getSingleRemoteInfo(
        'some_dir',
        'some_uuid',
      )
      expect(singleRemoteInfo).toHaveProperty('Bucket')
      expect(singleRemoteInfo.Bucket).toEqual('such_bucket')
    })
  })

  describe('getRemoteBucket', () => {
    it('returns an object with a Bucket property if the response contains that field', () => {
      const resp = 'something:something\nbucket: omg\nawesome:awesome'
      const params = remoteFiles.getRemoteBucket(resp)
      expect(params).toHaveProperty('Bucket')
      expect(params.Bucket).toEqual('omg')
    })
    it('returns an object with null Bucket property if the response does not contain the bucket field', () => {
      const resp = 'wow_this_is_a_bad_response'
      const params = remoteFiles.getRemoteBucket(resp)
      expect(params).toHaveProperty('Bucket')
      expect(params.Bucket).toBe(null)
    })
  })

  describe('processRemoteMetadata', () => {
    it('properly parses a git-annex remote metadata file', () => {
      const resp = 'timestamp remoteuuid:commitinfo xversionId#fileName'
      const remotesInfo = remoteFiles.processRemoteMetadata(resp)
      assert.lengthOf(remotesInfo, 1)
      const remoteObj = remotesInfo[0]
      expect(remoteObj).toHaveProperty('timestamp')
      expect(remoteObj.timestamp).toEqual('timestamp')
      expect(remoteObj).toHaveProperty('remoteUuid')
      expect(remoteObj.remoteUuid).toEqual('remoteuuid')
      expect(remoteObj).toHaveProperty('fileName')
      expect(remoteObj.fileName).toEqual('fileName')
      expect(remoteObj).toHaveProperty('versionId')
      expect(remoteObj.versionId).toEqual('versionId')
    })
    it('returns an empty array if there is an improperly formatted metadata file', () => {
      let remotesInfo
      const no_spaces = 'poorly_formatted_response' // contains no spaces
      remotesInfo = remoteFiles.processRemoteMetadata(no_spaces)
      assert.lengthOf(remotesInfo, 0)
      const not_enough_items = 'one two' // does not contain enough "columns"
      remotesInfo = remoteFiles.processRemoteMetadata(not_enough_items)
      assert.lengthOf(remotesInfo, 0)

      // does not have the properly one two:three xfour#five format
      const not_properly_formatted = 'one two:three four'
      remotesInfo = remoteFiles.processRemoteMetadata(not_properly_formatted)
      assert.lengthOf(remotesInfo, 0)
      const not_the_right_separators = 'one two:three xfour:five'
      remotesInfo = remoteFiles.processRemoteMetadata(not_the_right_separators)
      assert.lengthOf(remotesInfo, 0)
    })
    it('returns objects corresponding to any properly formatted line', () => {
      const one_line_right =
        'properly formatted:response xwith#a\nline_that_is_not_properly_formatted'
      const remotesInfo = remoteFiles.processRemoteMetadata(one_line_right)
      assert.lengthOf(remotesInfo, 1)
    })
  })

  describe('isGitAnnex', () => {
    it('returns false when fs.existsSync returns false', () => {
      fs.existsSync = jest.fn()
      fs.existsSync.mockReturnValue(false)
      const isGitAnnex = remoteFiles.isGitAnnex('some-path')
      expect(fs.existsSync).toHaveBeenCalled()
      expect(isGitAnnex).toBe(false)
    })
    it('returns true when fs.existsSync returns true', () => {
      fs.existsSync = jest.fn()
      fs.existsSync.mockReturnValue(true)
      const isGitAnnex = remoteFiles.isGitAnnex('some-path')
      expect(fs.existsSync).toHaveBeenCalled()
      expect(isGitAnnex).toBe(true)
    })
  })

  describe('tryRemote', () => {
    it('should resolve with the results of accessRemoteFile', done => {
      remoteFiles.getSingleRemoteInfo = jest.fn()
      remoteFiles.getSingleRemoteInfo.mockReturnValue({ Bucket: 'wow' })
      remoteFiles.accessRemoteFile = jest.fn()
      remoteFiles.accessRemoteFile.mockReturnValue(Promise.resolve('data'))
      remoteFiles
        .tryRemote(
          {},
          { dir: 'directory', file: { relativePath: 'wow', name: 'name' } },
        )
        .then(data => {
          expect(data)
          done()
        })
        .catch(done)
    })
  })
  // reset the fs object back to its normal state
  // so we dont break jest
  afterAll(() => {
    fs.existsSync.mockRestore()
  })
})
