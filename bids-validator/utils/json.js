import Issue from './issues'
import { JSHINT } from 'jshint'

/**
 * Similar to native JSON.parse but returns a promise and
 * runs jshint for more thorough error reporting
 */
function parse(file, contents) {
  return new Promise((resolve) => {
    let jsObj
    let err
    try {
      jsObj = JSON.parse(contents)
    } catch (exception) {
      err = exception
    } finally {
      if (err) {
        jshint(file, contents, function (issues) {
          resolve({ issues, parsed: null })
        })
      } else {
        resolve({ issues: [], parsed: jsObj })
      }
    }
  })
}

/**
 * JSHint
 *
 * Checks known invalid JSON file
 * content in order to produce a
 * verbose error message.
 */
function jshint(file, contents, callback) {
  var issues = []
  if (!JSHINT(contents)) {
    var out = JSHINT.data()
    for (var i = 0; out.errors.length > i; ++i) {
      var error = out.errors[i]
      if (error) {
        issues.push(
          new Issue({
            code: 27,
            file: file,
            line: error.line ? error.line : null,
            character: error.character ? error.character : null,
            reason: error.reason ? error.reason : null,
            evidence: error.evidence ? error.evidence : null,
          }),
        )
      }
    }
  }
  callback(issues)
}

export default {
  parse,
  jshint,
}
