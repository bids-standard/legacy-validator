import assert from 'assert'
import Issue from '../utils/issues'
import consoleFormat from '../utils/consoleFormat'

describe('console format', () => {
  let issues
  beforeEach(() => {
    issues = {
      errors: [
        {
          key: 'TEST_ERROR',
          severity: 'error',
          reason: 'testing consoleFormat',
          files: [
            new Issue({
              key: 'TEST_ERROR',
              file: '/nonexistent/test/file.wut',
              code: 0,
              evidence: 'none',
              line: -1,
              character: -1,
              severity: 'error',
              reason: 'testing consoleFormat',
            }),
          ],
          additionalFileCount: 0,
        },
      ],
      warnings: [
        {
          key: 'TEST_WARNING',
          severity: 'warning',
          reason: 'testing consoleFormat',
          files: [
            new Issue({
              key: 'TEST_WARNING',
              file: '/nonexistent/test/file.wut',
              code: 2,
              evidence: 'none',
              line: -1,
              character: -1,
              severity: 'warning',
              reason: 'testing consoleFormat',
            }),
          ],
          additionalFileCount: 0,
        },
      ],
      summary: {
        sessions: [],
        subjects: [],
        tasks: [],
        modalities: [],
        totalFiles: 0,
        size: 0,
      },
    }
  })

  describe('logIssues', () => {
    it('takes an array of errors and returns them formatted as an array', () => {
      const output = consoleFormat.logIssues(issues.errors, 'red', {
        verbose: true,
      })
      assert(Array.isArray(output))
      assert.deepEqual(output, [
        '\t\u001b[31m1: [ERR] testing consoleFormat (code: undefined - TEST_ERROR)\u001b[39m',
        '\t\ttesting consoleFormat',
        '\t\t@ line: -1 character: -1',
        '\t\tEvidence: none',
        '',
      ])
    })
    it('takes an array of warnings and returns them formatted as an array', () => {
      const output = consoleFormat.logIssues(issues.warnings, 'yellow', {
        verbose: true,
      })
      assert.deepEqual(output, [
        '\t\u001b[33m1: [WARN] testing consoleFormat (code: undefined - TEST_WARNING)\u001b[39m',
        '\t\ttesting consoleFormat',
        '\t\t@ line: -1 character: -1',
        '\t\tEvidence: none',
        '',
      ])
    })
  })

  describe('issues', () => {
    it('formats issues as a string a given issues object', () => {
      const output = consoleFormat.issues(issues, {})
      assert.equal(typeof output, 'string')
    })
  })

  describe('summary', () => {
    it('formats summary as a string a given issues object', () => {
      const output = consoleFormat.summary(issues.summary, {})
      assert.equal(typeof output, 'string')
    })
  })
})
