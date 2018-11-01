/**
 * eslint no-console: ["error", { allow: ["log"] }]
 * @jest-environment ./tests/env/ExamplesEnvironment.js
 */
const { assert } = require('chai')
const validate = require('../index.js')
const fs = require('fs')
const path = require('path')

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory()
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
  'ds108',
  'ds109',
  'ds113b',
  'ds000117',
  'ds000247',
]

function assertErrorCode(errors, expected_error_code) {
  var matchingErrors = errors.filter(function(error) {
    return error.code === expected_error_code
  })
  assert(matchingErrors.length > 0)
}

describe('BIDS example datasets ', function() {
  describe('basic example dataset tests', () => {
    getDirectories(
      'tests/data/bids-examples-' + global.test_version + '/',
    ).forEach(function testDataset(path) {
      it(path, isdone => {
        const options = { ignoreNiftiHeaders: true }
        validate.BIDS(
          'tests/data/bids-examples-' + global.test_version + '/' + path + '/',
          options,
          function(issues) {
            var errors = issues.errors
            var warnings = issues.warnings
            assert.deepEqual(
              errors.filter(issue => issue.key !== 'EMPTY_FILE'),
              [],
            )
            var session_flag = false
            for (var warning in warnings) {
              if (warnings[warning]['code'] === '38') {
                session_flag = true
                break
              }
            }
            if (missing_session_files.indexOf(path) === -1) {
              assert.deepEqual(session_flag, false)
            } else {
              assert.deepEqual(session_flag, true)
            }
            isdone()
          },
        )
      })
    })
  })

  // we need to have at least one non-dynamic test
  it('validates path without trailing backslash', function(isdone) {
    var options = { ignoreNiftiHeaders: true }
    validate.BIDS(
      'tests/data/bids-examples-' + global.test_version + '/ds001',
      options,
      function(issues, summary) {
        var errors = issues.errors
        var warnings = issues.warnings
        assert(summary.sessions.length === 0)
        assert(summary.subjects.length === 16)
        assert.deepEqual(summary.tasks, ['balloon analog risk task'])
        assert(summary.modalities.includes('T1w'))
        assert(summary.modalities.includes('inplaneT2'))
        assert(summary.modalities.includes('bold'))
        assert(summary.totalFiles === 133)
        assert.deepEqual(errors, [])
        assert(warnings.length === 2 && warnings[0].code === '13')
        isdone()
      },
    )
  })

  // we need to have at least one non-dynamic test
  it('validates dataset with valid nifti headers', function(isdone) {
    var options = { ignoreNiftiHeaders: false }
    validate.BIDS('tests/data/valid_headers', options, function(
      issues,
      summary,
    ) {
      var errors = issues.errors
      var warnings = issues.warnings
      assert(summary.sessions.length === 0)
      assert(summary.subjects.length === 1)
      assert.deepEqual(summary.tasks, ['rhyme judgment'])
      assert(summary.modalities.includes('T1w'))
      assert(summary.modalities.includes('bold'))
      assert(summary.totalFiles === 10)
      assert(errors[0].code === '60')
      assert(warnings.length === 3 && warnings[0].code === '13')
      isdone()
    })
  })

  // test for duplicate files present with both .nii and .nii.gz extension
  it('validates dataset for duplicate files present with both .nii and .nii.gz extension', function(isdone) {
    var options = { ignoreNiftiHeaders: false }
    validate.BIDS('tests/data/valid_filenames', options, function(issues) {
      assertErrorCode(issues.errors, '74')
      isdone()
    })
  })

  // test for illegal characters used in acq and task name
  it('validates dataset with illegal characters in task name', function(isdone) {
    var options = { ignoreNiftiHeaders: false }
    validate.BIDS('tests/data/valid_filenames', options, function(issues) {
      assertErrorCode(issues.errors, '58')
      isdone()
    })
  })

  // test for illegal characters used in sub name
  it('validates dataset with illegal characters in sub name', function(isdone) {
    var options = { ignoreNiftiHeaders: false }
    validate.BIDS('tests/data/valid_filenames', options, function(issues) {
      assertErrorCode(issues.errors, '64')
      isdone()
    })
  })

  it('checks for subjects with no valid data', function(isdone) {
    var options = { ignoreNiftiHeaders: true }
    validate.BIDS('tests/data/no_valid_data', options, function(issues) {
      assertErrorCode(issues.errors, '67')
      isdone()
    })
  })

  it('validates MRI modalities', function(isdone) {
    var options = { ignoreNiftiHeaders: true }
    validate.BIDS(
      'tests/data/bids-examples-' + global.test_version + '/ds001',
      options,
      function(issues, summary) {
        var errors = issues.errors
        var warnings = issues.warnings
        assert(summary.sessions.length === 0)
        assert(summary.subjects.length === 16)
        assert.deepEqual(summary.tasks, ['balloon analog risk task'])
        assert(summary.modalities.includes('T1w'))
        assert(summary.modalities.includes('inplaneT2'))
        assert(summary.modalities.includes('bold'))
        assert(summary.totalFiles === 133)
        assert.deepEqual(errors, [])
        assert(warnings.length === 2 && warnings[0].code === '13')
        isdone()
      },
    )
  })

  it('checks for data dictionaries without corresponding data files', function(isdone) {
    var options = { ignoreNiftiHeaders: true }
    validate.BIDS('tests/data/unused_data_dict', options, function(issues) {
      assert.notEqual(issues.errors.findIndex(issue => issue.code === '90'), -1)
      isdone()
    })
  })

  it('checks for fieldmaps with no _magnitude file', function(isdone) {
    var options = { ignoreNiftiHeaders: true }
    validate.BIDS('tests/data/fieldmap_without_magnitude', options, function(
      issues,
    ) {
      assert.notEqual(issues.errors.findIndex(issue => issue.code === '91'), -1)
      isdone()
    })
  })

  it('should not throw a warning if all _phasediff.nii are associated with _magnitude1.nii', function(isdone) {
    var options = { ignoreNiftiHeaders: true }
    validate.BIDS(
      'tests/data/bids-examples-' + global.test_version + '/hcp_example_bids',
      options,
      function(issues) {
        assert.deepEqual(issues.errors, [])
        isdone()
      },
    )
  })

  it('should throw a warning if there are _phasediff.nii without an associated _magnitude1.nii', function(isdone) {
    var options = { ignoreNiftiHeaders: true }
    validate.BIDS('tests/data/phasediff_without_magnitude1', options, function(
      issues,
    ) {
      assert(issues.warnings.length == 2 && issues.warnings[1].code === '92')
      isdone()
    })
  })
})
