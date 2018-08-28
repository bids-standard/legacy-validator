var utils = require('../../utils')
var reset = require('./reset')
var obj = require('./obj')
var quickTest = require('./quickTest')
var fullTest = require('./fullTest')
var quickTestError = require('./quickTestError')

/**
 * Start
 *
 * Takes either a filelist array or
 * a path to a BIDS directory and an
 * options object and starts
 * the validation process and
 * returns the errors and warnings as
 * arguments to the callback.
 */
function start(dir, options, callback) {
  let self = obj.BIDS
  let summary = obj.summary
  utils.options.parse(options, function(issues, options) {
    if (issues && issues.length > 0) {
      // option parsing issues
      callback({ config: issues })
    } else {
      self.options = options
      reset(self)
      utils.files.readDir(dir, function(files) {
        quickTest(self, files, function(couldBeBIDS) {
          if (couldBeBIDS) {
            fullTest(self, files, callback)
          } else {
            // Return an error immediately if quickTest fails
            var issue = quickTestError(dir)
            summary.totalFiles = Object.keys(files).length
            callback(utils.issues.format([issue], summary, options))
          }
        })
      })
    }
  })
}

module.exports = start
