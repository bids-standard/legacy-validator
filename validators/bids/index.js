var start = require('./start')
var reset = require('./reset')
var quickTest = require('./quickTest')
var quickTestError = require('./quickTestError')
var fullTest = require('./fullTest')
var mismatchTest = require('./sesMismatch')

module.exports = {
  options: {},
  issues: [],
  start: start,
  quickTestError: quickTestError,
  quickTest: quickTest,
  fullTest: fullTest,
  subIDsesIDmismatchtest: mismatchTest,
  reset: reset,
}
