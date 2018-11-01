const assert = require('assert')
const utils = require('../../utils')
const groupFileTypes = require('../../validators/bids/groupFileTypes')
const validateMisc = require('../../utils/files/validateMisc')

const setupMocks = () => {
  // Mock version of the File API for tests
  global.File = function MockFile(data, fileName, options) {
    assert(data.hasOwnProperty('length'))
    assert.equal(typeof data[0], 'string')
    this._data = data
    this._options = options
    this.name = fileName
  }
}
const cleanupMocks = () => {
  delete global.File
}

describe('files utils in nodejs', () => {
  describe('FileAPI', () => {
    it('should return a mock implementation', () => {
      let File = utils.files.FileAPI()
      assert(typeof File !== 'undefined')
      assert(File.name === 'NodeFile')
    })
  })
  describe('newFile', () => {
    it('creates a new File API object', () => {
      let file = utils.files.newFile('test-file')
      assert.equal(file.name, 'test-file')
    })
  })
})

describe('files utils in browsers', () => {
  beforeAll(setupMocks)
  afterAll(cleanupMocks)
  describe('newFile', () => {
    it('creates a new File API object', () => {
      const test_file = utils.files.newFile('test-file')
      assert(File.prototype.isPrototypeOf(test_file))
    })
  })
})

describe('validateMisc', () => {
  let filelist, dir

  beforeAll(() => {
    dir = `${process.cwd()}/tests/data/empty_files`
  })

  beforeEach(() => {
    utils.files.readDir(dir, files => {
      filelist = files
    })
  })
  it('returns issues for empty files (0kb)', done => {
    const files = groupFileTypes(filelist, {})

    validateMisc(files.misc).then(issues => {
      assert.ok(issues.length > 0)
      assert.ok(issues.every(issue => issue instanceof utils.issues.Issue))
      assert.notStrictEqual(issues.findIndex(issue => issue.code === 97), -1)
      done()
    })
  })
})
