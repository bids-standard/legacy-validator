/**
 * @jest-environment jsdom
 */

const assert = require('assert')
const utils = require('../../../bids-validator/utils')
const groupFileTypes = require('../../../bids-validator/validators/bids/groupFileTypes')
const checkReadme = require('../../../bids-validator/validators/bids/checkReadme.js')
const checkDatasetDescription = require('../../../bids-validator/validators/bids/checkDatasetDescription.js')
const validateMisc = require('../../../bids-validator/utils/files/validateMisc')
const { createFile, createFileList } = require('../env/FileList')

describe('files utils in nodejs', () => {
  describe('FileAPI', () => {
    it('should not return a mock implementation', () => {
      let File = utils.files.FileAPI()
      assert(File.name !== 'NodeFile')
    })
  })
})

describe('files utils in browsers', () => {
  describe('newFile', () => {
    it('creates a new File API object', () => {
      const test_file = utils.files.newFile('test-file')
      assert.equal(test_file.name, 'test-file')
      assert(File.prototype.isPrototypeOf(test_file))
    })
  })
})

describe('dataset_description.json', () => {
  it('throws warning if it does not exist in proper location', () => {
    const fileList = {}
    const issues = checkDatasetDescription(fileList)
    assert(issues[0].key === 'DATASET_DESCRIPTION_JSON_MISSING')
  })
})

describe('README', () => {
  it('throws warning if it does not exist in proper location', () => {
    const fileList = {
      1: {
        name: 'README',
        path: 'tests/data/bids-examples-1.1.1u1/ds001/not-root-dir/README',
        relativePath: '/not-root-dir/README',
      },
    }
    const issues = checkReadme(fileList)
    assert(issues[0].key === 'README_FILE_MISSING')
  })
})

describe('validateMisc', () => {
  let filelist = [], 
      dir

  beforeAll(() => {
    // contains stripped down CTF format dataset: Both, BadChannels and
    // bad.segments files can be empty and still valid. Everything else must
    // not be empty.
    dir = `${process.cwd()}/bids-validator/tests/data/empty_files`
  })
  
  // generate an array of browser Files
  beforeEach(() => { filelist = createFileList(dir) })

  it('returns issues for empty files (0kb), accepting a limited set of exceptions', done => {
    const files = groupFileTypes(filelist, {})

    validateMisc(files.misc).then(issues => {
      // *.meg4 and BadChannels files are empty. But only *.meg4 is an issue
      assert.ok(issues.length == 1)
      assert.ok(issues.every(issue => issue instanceof utils.issues.Issue))
      assert.notStrictEqual(issues.findIndex(issue => issue.code === 99), -1)
      assert.ok(issues[0].file.name == 'sub-0001_task-AEF_run-01_meg.meg4')
      done()
    })
  })
})