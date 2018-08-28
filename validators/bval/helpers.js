var Issue = require('../../utils').issues.Issue
var type = require('../../utils').type

function checkType(contents, file) {
  let issues = []
  // throw error if contents are not string
  if (!type.checkType(contents, 'string')) {
    let evidence =
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
  let issues = []
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
  let issues = []
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

module.exports = {
  checkType: checkType,
  checkSeparatorAndValueType: checkSeparatorAndValueType,
  checkNumberOfRows: checkNumberOfRows,
}
