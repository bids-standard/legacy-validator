const helpers = require('./helpers')

/**
 * bvec
 *
 * Takes a bvec file, its contents as a string
 * and a callback as arguments. Callsback
 * with any issues it finds while validating
 * against the BIDS specification.
 */
module.exports = function bvec(file, contents, callback) {
  let issues = []

  issues = issues.concat(helpers.checkType(contents, file))
  if (issues.length) {
    return callback(issues)
  }

  // check that there are exactly three rows
  issues = issues.concat(helpers.checkNumberOfRows(contents, file))

  // check that each row is the same length
  issues = issues.concat(helpers.checkRowConsistency(contents, file))

  // check that each value is a number
  issues = issues.concat(helpers.checkValueValidity(contents, file))

  callback(issues)
}
