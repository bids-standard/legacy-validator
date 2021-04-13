import Issue from '../../utils/issues/issue.js'
import { type } from '../../utils'

/**
 * bval
 *
 * Takes a bval file, its contents as a string
 * and a callback as arguments. Callsback
 * with any issues it finds while validating
 * against the BIDS specification.
 */
export default function bval(file, contents, callback) {
  let issues = []

  // break val if type of contents is not string
  issues = issues.concat(checkType(contents, file))
  if (issues.length) {
    return callback(issues)
  }

  // check number of rows in contents
  issues = issues.concat(checkNumberOfRows(contents, file))

  // check for proper separator and value type
  issues = issues.concat(checkSeparatorAndValueType(contents, file))

  callback(issues)
}

function checkType(contents, file) {
  const issues = []
  // throw error if contents are not string
  if (!type.checkType(contents, 'string')) {
    const evidence =
      'The contents of this .bval file have type ' +
      typeof contents +
      ' but should be a string.'
    issues.push(
      new Issue({
        code: 89,
        file: file,
        evidence: evidence,
      }),
    )
  }
  return issues
}

function checkSeparatorAndValueType(contents, file) {
  const issues = []
  const row = contents.replace(/^\s+|\s+$/g, '').split(' ')
  let invalidValue = false
  for (let j = 0; j < row.length; j++) {
    const value = row[j]
    if (!type.checkType(value, 'number')) {
      invalidValue = true
    }
  }
  if (invalidValue) {
    issues.push(
      new Issue({
        code: 47,
        file: file,
      }),
    )
  }
  return issues
}

function checkNumberOfRows(contents, file) {
  const issues = []
  const numberOfRows = contents.replace(/^\s+|\s+$/g, '').split('\n').length
  if (numberOfRows !== 1) {
    issues.push(
      new Issue({
        code: 30,
        file: file,
      }),
    )
  }
  return issues
}
