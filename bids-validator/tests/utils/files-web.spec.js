/**
 * eslint no-console: ["error", { allow: ["log"] }]
 * @jest-environment jsdom
 */

import assert from 'assert'

import utils from '../../../bids-validator/utils'
import groupFileTypes from '../../../bids-validator/validators/bids/groupFileTypes'
import checkReadme from '../../../bids-validator/validators/bids/checkReadme.js'
import checkDatasetDescription from '../../../bids-validator/validators/bids/checkDatasetDescription.js'
import validateMisc from '../../../bids-validator/utils/files/validateMisc'
import { createFileList } from '../env/FileList'

describe('files in browser', () => {
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
          size: 20,
        },
      }
      const issues = checkReadme(fileList)
      assert(issues[0].key === 'README_FILE_SMALL')
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
    beforeEach(() => {
      filelist = createFileList(dir)
    })

    it('returns issues for empty files (0kb), accepting a limited set of exceptions', (done) => {
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
})
