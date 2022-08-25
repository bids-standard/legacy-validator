import assert from 'assert'
import utils from '../../utils'

describe('issues', () => {
  describe('exceptionHandler', () => {
    let testErr, issueList, summary, options, formattedIssues

    beforeAll(() => {
      testErr = new Error('oh no')
      issueList = []
      summary = {
        sessions: [],
        subjects: [],
        tasks: [],
        modalities: [],
        totalFiles: 0,
        size: 0,
      }
      options = {
        ignoreWarnings: false,
        ignoreNiftiHeaders: false,
        verbose: false,
        config: {},
      }
      formattedIssues = utils.issues.exceptionHandler(
        testErr,
        issueList,
        summary,
        options,
      )
    })

    it('adds INTERNAL ERROR to the issues.errors list', () => {
      assert.equal(formattedIssues.errors[0].key, 'INTERNAL ERROR')
    })

    it("creates a properly formatted issue in the error's files property", () => {
      const exceptionIssue = formattedIssues.errors[0].files[0]
      assert.ok(utils.issues.isAnIssue(exceptionIssue))
    })

    it('gives a reason for the error', () => {
      const exceptionIssue = formattedIssues.errors[0].files[0]
      assert.equal(
        exceptionIssue.reason,
        `${testErr.message}; please help the BIDS team and community by opening an issue at (https://github.com/bids-standard/bids-validator/issues) with the evidence here.`,
      )
    })
  })

  describe('exception/issue redirect', () => {
    let promise, innerPromise, validIssue, invalidIssue
    beforeAll(() => {
      promise = null
      validIssue = new utils.issues.Issue({
        code: 12,
        file: 'goodstuff.json',
        reason: 'a series of unfortunate events',
      })
      invalidIssue = new Error('oops')

      promise = () => {
        return new Promise((resolve, reject) => {
          innerPromise().catch((err) =>
            utils.issues.redirect(err, reject, () => {
              resolve()
            }),
          )
        })
      }
    })

    it('resolves with valid issue', (done) => {
      innerPromise = () =>
        new Promise((_, reject) => {
          reject(validIssue)
        })

      promise().then(() => done())
    })

    it('rejects exceptions', (done) => {
      innerPromise = () =>
        new Promise((_, reject) => {
          reject(invalidIssue)
        })

      promise().catch(() => done())
    })

    it('passes the exception through the error', (done) => {
      innerPromise = () =>
        new Promise((_, reject) => {
          reject(invalidIssue)
        })

      promise().catch((err) => {
        assert.deepEqual(err, invalidIssue)
        done()
      })
    })
  })
})
