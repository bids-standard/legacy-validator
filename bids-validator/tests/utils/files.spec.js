import assert from 'assert'
import utils from '../../utils'
import groupFileTypes from '../../validators/bids/groupFileTypes'
import checkReadme from '../../validators/bids/checkReadme.js'
import checkDatasetDescription from '../../validators/bids/checkDatasetDescription.js'
import validateMisc from '../../utils/files/validateMisc'

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

describe('dataset_description.json', () => {
  it('throws warning if it does not exist in proper location', () => {
    const jsonFileContents = {}
    const issues = checkDatasetDescription(jsonFileContents)
    assert(issues[0].key === 'DATASET_DESCRIPTION_JSON_MISSING')
  })
  it('throws a warning if the Authors field of the dataset description has a single entry and less than two commas', () => {
    const jsonFileContents = {
      '/dataset_description.json': {
        Authors: ['An, Author'],
      },
    }
    const issues = checkDatasetDescription(jsonFileContents)
    assert(issues[0].key === 'TOO_FEW_AUTHORS')
  })
  it('throws an error if the Authors field of the dataset description has a single field and multiple commas', () => {
    const jsonFileContents = {
      '/dataset_description.json': {
        Authors: [
          'Too many, Commas, Indicate, That the user, May not have, Separated authors, Into an array',
        ],
      },
    }
    const issues = checkDatasetDescription(jsonFileContents)
    assert(issues[0].key === 'MULTIPLE_COMMAS_IN_AUTHOR_FIELD')
  })
})

describe('README', () => {
  it('throws warning if it does not exist in proper location', () => {
    const fileList = {
      1: {
        name: 'README',
        path: 'tests/data/bids-examples/ds001/not-root-dir/README',
        relativePath: '/not-root-dir/README',
      },
    }
    const issues = checkReadme(fileList)
    assert(issues[0].key === 'README_FILE_MISSING')
  })

  it('throws warning if it is too small', () => {
    const fileList = {
      1: {
        name: 'README',
        path: 'tests/data/bids-examples/ds001/README',
        relativePath: '/README',
        stats: { size: 20 },
      },
    }
    const issues = checkReadme(fileList)
    assert(issues[0].key === 'README_FILE_SMALL')
  })
})

describe('validateMisc', () => {
  let filelist, dir

  beforeAll(() => {
    // contains stripped down CTF format dataset: Both, BadChannels and
    // bad.segments files can be empty and still valid. Everything else must
    // not be empty.
    dir = `${process.cwd()}/bids-validator/tests/data/empty_files`
  })

  beforeEach(() => {
    return utils.files.readDir(dir).then((files) => {
      filelist = files
    })
  })
  it('returns issues for empty files (0kb), accepting a limited set of exceptions', (done) => {
    utils.collectSummary(filelist, {})
    const files = groupFileTypes(filelist, {})

    validateMisc(files.misc).then((issues) => {
      // *.meg4 and BadChannels files are empty. But only *.meg4 is an issue
      assert.ok(issues.length == 1)
      assert.ok(issues.every((issue) => issue instanceof utils.issues.Issue))
      assert.notStrictEqual(
        issues.findIndex((issue) => issue.code === 99),
        -1,
      )
      assert.ok(issues[0].file.name == 'sub-0001_task-AEF_run-01_meg.meg4')
      done()
    })
  })
})
