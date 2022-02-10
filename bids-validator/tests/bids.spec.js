/**
 * eslint no-console: ["error", { allow: ["log"] }]
 */
import { assert } from 'chai'

import validate from '../index.js'
import fs from 'fs'
import path from 'path'
import { createFileList } from './env/FileList.js'
import isNode from '../utils/isNode.js'

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return (
      file !== '.git' && fs.statSync(path.join(srcpath, file)).isDirectory()
    )
  })
}

var missing_session_files = [
  '7t_trt',
  'ds006',
  'ds007',
  'ds008',
  'ds051',
  'ds052',
  'ds105',
  'ds109',
  'ds113b',
  'ds000117',
  'ds000247',
  'ieeg_motorMiller2007',
  'ieeg_visual',
]

const dataDirectory = path.join('bids-validator', 'tests', 'data')

// Generate validate.BIDS input for included minimal tests
function createDatasetFileList(inputPath) {
  const testDatasetPath = path.join(dataDirectory, inputPath)
  if (!isNode) {
    return createFileList(testDatasetPath)
  } else {
    return testDatasetPath
  }
}

// Generate validate.BIDS input for bids-examples
function createExampleFileList(inputPath) {
  return createDatasetFileList(path.join('bids-examples', inputPath))
}

function assertErrorCode(errors, expected_error_code) {
  var matchingErrors = errors.filter(function(error) {
    return error.code === expected_error_code
  })
  assert(matchingErrors.length > 0)
}

describe('BIDS example datasets ', function() {
  // Default validate.BIDS options
  const options = { ignoreNiftiHeaders: true, json: true }
  const enableNiftiHeaders = { json: true }

  describe('basic example dataset tests', () => {
    const bidsExamplePath = path.join(dataDirectory, 'bids-examples')
    getDirectories(bidsExamplePath).forEach(function testDataset(inputPath) {
      it(inputPath, isdone => {
        validate.BIDS(createExampleFileList(inputPath), options, function(
          issues,
        ) {
          let warnings = issues.warnings
          let session_flag = false
          for (var warning in warnings) {
            if (warnings[warning]['code'] === 38) {
              session_flag = true
              break
            }
          }
          if (missing_session_files.indexOf(inputPath) === -1) {
            assert.deepEqual(session_flag, false)
          } else {
            assert.deepEqual(session_flag, true)
          }
          isdone()
        })
      })
    })
  })

  // we need to have at least one non-dynamic test
  it('validates path without trailing backslash', function(isdone) {
    validate.BIDS(createExampleFileList('ds001'), options, function(
      issues,
      summary,
    ) {
      var errors = issues.errors
      var warnings = issues.warnings
      assert(summary.sessions.length === 0)
      assert(summary.subjects.length === 16)
      assert.deepEqual(summary.tasks, ['balloon analog risk task'])
      expect(summary.modalities).toEqual(['MRI'])
      assert(summary.totalFiles === 134)
      assert.deepEqual(errors.length, 1)
      assert(warnings.length === 2)
      assert(
        warnings.findIndex(warning => warning.code === 13) > -1,
        'warnings do not contain a code 13',
      )
      isdone()
    })
  })

  // we need to have at least one non-dynamic test
  it('validates dataset with valid nifti headers', function(isdone) {
    var options = { ignoreNiftiHeaders: false }
    validate.BIDS(createDatasetFileList('valid_headers'), options, function(
      issues,
      summary,
    ) {
      var errors = issues.errors
      var warnings = issues.warnings
      assert(summary.sessions.length === 0)
      assert(summary.subjects.length === 1)
      assert.deepEqual(summary.tasks, ['rhyme judgment'])
      assert.isFalse(summary.dataProcessed)
      expect(summary.modalities).toEqual(['MRI'])
      expect(summary.totalFiles).toEqual(8)
      assert(
        errors.findIndex(error => error.code === 60) > -1,
        'errors do not contain a code 60',
      )
      assert.deepEqual(warnings.length, 4)
      assert(
        warnings.findIndex(warning => warning.code === 13) > -1,
        'warnings do not contain a code 13',
      )
      assert.deepEqual(summary.subjectMetadata[0], {
        age: 25,
        participantId: '01',
        sex: 'M',
      })
      isdone()
    })
  })

  // test for duplicate files present with both .nii and .nii.gz extension
  it('validates dataset for duplicate files present with both .nii and .nii.gz extension', function(isdone) {
    validate.BIDS(
      createDatasetFileList('valid_filenames'),
      enableNiftiHeaders,
      function(issues) {
        assertErrorCode(issues.errors, 74)
        isdone()
      },
    )
  })

  it('includes issue 53 NO_T1W for dataset without T1w files', function(isdone) {
    validate.BIDS(createDatasetFileList('no_t1w'), options, function(issues) {
      assertErrorCode(issues.ignored, 53)
      isdone()
    })
  })

  // test for illegal characters used in acq and task name
  it('validates dataset with illegal characters in task name', function(isdone) {
    validate.BIDS(
      createDatasetFileList('valid_filenames'),
      enableNiftiHeaders,
      function(issues) {
        assertErrorCode(issues.errors, 58)
        isdone()
      },
    )
  })

  // test for illegal characters used in sub name
  it('validates dataset with illegal characters in sub name', function(isdone) {
    validate.BIDS(
      createDatasetFileList('valid_filenames'),
      enableNiftiHeaders,
      function(issues) {
        assertErrorCode(issues.errors, 64)
        isdone()
      },
    )
  })

  it('checks for subjects with no valid data', function(isdone) {
    validate.BIDS(createDatasetFileList('no_valid_data'), options, function(
      issues,
    ) {
      assertErrorCode(issues.errors, 67)
      isdone()
    })
  })

  it('validates MRI modalities', function(isdone) {
    validate.BIDS(createExampleFileList('ds001'), options, function(
      issues,
      summary,
    ) {
      var errors = issues.errors
      var warnings = issues.warnings
      assert(summary.sessions.length === 0)
      assert(summary.subjects.length === 16)
      assert.deepEqual(summary.tasks, ['balloon analog risk task'])
      assert(summary.modalities.includes('MRI'))
      assert(summary.totalFiles === 134)
      assert.deepEqual(errors.length, 1)
      assert(warnings.length === 2)
      assert(
        warnings.findIndex(warning => warning.code === 13) > -1,
        'warnings do not contain a code 13',
      )
      isdone()
    })
  })

it('blacklists modalities specified', function(isdone) {

    const _options = { ...options, blacklistModalities: ['MRI'] }
    validate.BIDS(createExampleFileList('ds001'), _options, function(
      issues,
      summary,
    ) {
      var errors = issues.errors
      var warnings = issues.warnings
      assert(summary.sessions.length === 0)
      assert(summary.subjects.length === 16)
      assert.deepEqual(summary.tasks, ['balloon analog risk task'])
      assert(summary.modalities.includes('MRI'))
      assert(summary.totalFiles === 134)
      assert.deepEqual(errors.length, 2)
      assert(warnings.length === 2)
      assert(
        warnings.findIndex(warning => warning.code === 13) > -1,
        'warnings do not contain a code 13',
      )
      assert(
        errors.findIndex(error => error.code === 139) > -1,
        'errors do contain a code 139',
      )

      isdone()
    })
  })


  it('checks for data dictionaries without corresponding data files', function(isdone) {
    validate.BIDS(createDatasetFileList('unused_data_dict'), options, function(
      issues,
    ) {
      assert.notEqual(
        issues.errors.findIndex(issue => issue.code === 90),
        -1,
      )
      isdone()
    })
  })

  it('checks for fieldmaps with no _magnitude file', function(isdone) {
    validate.BIDS(
      createDatasetFileList('fieldmap_without_magnitude'),
      options,
      function(issues) {
        assert.notEqual(
          issues.errors.findIndex(issue => issue.code === 91),
          -1,
        )
        isdone()
      },
    )
  })

  it('should not throw a warning if all _phasediff.nii are associated with _magnitude1.nii', function(isdone) {
    validate.BIDS(createExampleFileList('hcp_example_bids'), options, function(
      issues,
    ) {
      assert.deepEqual(issues.errors, [])
      isdone()
    })
  })

  it('should throw a warning if there are _phasediff.nii without an associated _magnitude1.nii', function(isdone) {
    validate.BIDS(
      createDatasetFileList('phasediff_without_magnitude1'),
      options,
      function(issues) {
        assert.notEqual(issues.warnings.findIndex(issue => issue.code === 92))
        isdone()
      },
    )
  })

  it('should not throw an error if it encounters no non-utf-8 files', function(isdone) {
    validate.BIDS(createDatasetFileList('valid_dataset'), options, function(
      issues,
    ) {
      assert.equal(
        issues.errors.findIndex(issue => issue.code === 123),
        -1,
      )
      isdone()
    })
  })

  it('should validate pet data', function(isdone) {
    validate.BIDS(
      createDatasetFileList('broken_pet_example_2-pet_mri'),
      options,
      function(issues) {
        assertErrorCode(issues.errors, 55)
        isdone()
      },
    )
  })

  it('should validate pet blood data', function(isdone) {
    validate.BIDS(
      createDatasetFileList('broken_pet_example_3-pet_blood'),
      options,
      function(issues) {
        assertErrorCode(issues.errors, 55)
        isdone()
      },
    )
  })

  it('should catch missing tsv columns', function(isdone) {
    validate.BIDS(
      createDatasetFileList('pet_blood_missing_tsv_column'),
      options,
      function(issues) {
        assertErrorCode(issues.errors, 211)
        isdone()
      },
    )
  })
})
