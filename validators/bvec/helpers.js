var Issue = require('../../utils').issues.Issue
var type = require('../../utils').type

function checkType(contents, file) {
  let issues = []
  // throw error if contents are undefined or the wrong type
  if (!type.checkType(contents, 'string')) {
    let evidence = contents
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
  let issues = []
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
      .map(value => !type.checkType(value, 'number'))
      .some(val => val)
    if (hasIssue) {
      return [new Issue({ code: 47, file: file })]
    }
  }
  return []
}

module.exports = {
  checkValueValidity: checkValueValidity,
  checkNumberOfRows: checkNumberOfRows,
  checkRowConsistency: checkRowConsistency,
  checkType: checkType,
}
