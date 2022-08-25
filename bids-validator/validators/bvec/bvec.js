const Issue = require('../../utils').issues.Issue
import { type } from '../../utils'

/**
 * bvec
 *
 * Takes a bvec file, its contents as a string
 * and a callback as arguments. Callsback
 * with any issues it finds while validating
 * against the BIDS specification.
 */
export default function bvec(file, contents, callback) {
  let issues = []

  issues = issues.concat(checkType(contents, file))
  if (issues.length) {
    return callback(issues)
  }

  // check that there are exactly three rows
  issues = issues.concat(checkNumberOfRows(contents, file))

  // check that each row is the same length
  issues = issues.concat(checkRowConsistency(contents, file))

  // check that each value is a number
  issues = issues.concat(checkValueValidity(contents, file))

  callback(issues)
}

function checkType(contents, file) {
  const issues = []
  // throw error if contents are undefined or the wrong type
  if (!type.checkType(contents, 'string')) {
    const evidence = contents
      ? 'The contents of this .bvec file have type ' +
        typeof contents +
        ' but should be a string.'
      : 'The contents of this .bvec file are undefined.'
    issues.push(
      new Issue({
        code: 88,
        file: file,
        evidence: evidence,
      }),
    )
  }
  return issues
}

function checkNumberOfRows(contents, file) {
  const issues = []
  if (contents.replace(/^\s+|\s+$/g, '').split('\n').length !== 3) {
    issues.push(
      new Issue({
        code: 31,
        file: file,
      }),
    )
  }
  return issues
}

function checkRowConsistency(contents, file) {
  let rowLength = false

  const rows = contents.replace(/^\s+|\s+$/g, '').split('\n')

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].replace(/^\s+|\s+$/g, '').split(' ')
    if (!rowLength) {
      rowLength = row.length
    }

    // check for consistent row length
    if (rowLength !== row.length) {
      return [new Issue({ code: 46, file: file })]
    }
  }
  return []
}

function checkValueValidity(contents, file) {
  const rows = contents.replace(/^\s+|\s+$/g, '').split('\n')
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].replace(/^\s+|\s+$/g, '').split(' ')

    // check for proper separator and value type
    const hasIssue = row
      .map((value) => !type.checkType(value, 'number'))
      .some((val) => val)
    if (hasIssue) {
      return [new Issue({ code: 47, file: file })]
    }
  }
  return []
}
