const helpers = require('./helpers')

function bval(file, contents, callback) {
  let issues = []

  // break val if type of contents is not string
  issues = issues.concat(helpers.checkType(contents, file))
  if (issues.length) {
    return callback(issues)
  }

  // check number of rows in contents
  issues = issues.concat(helpers.checkNumberOfRows(contents, file))

  // check for proper separator and value type
  issues = issues.concat(helpers.checkSeparatorAndValueType(contents, file))

  callback(issues)
}

module.exports = bval
