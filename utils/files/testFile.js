const fs = require('fs')
const Issue = require('../../utils/issues').Issue

/**
 * Test File
 *
 * Takes a file and callback and tests if it's viable for
 * reading. Calls back with an error and stats if it isn't
 * or null and stats if it is.
 */
function testFile(file, callback) {
  fs.stat(file.path, function(statErr, stats) {
    if (statErr) {
      fs.lstat(file.path, function(lstatErr, lstats) {
        if (lstatErr) {
          callback(new Issue({ code: 44, file: file }), stats)
        } else if (lstats && lstats.isSymbolicLink()) {
          callback(new Issue({ code: 43, file: file }), stats)
        } else {
          callback(new Issue({ code: 44, file: file }), stats)
        }
      })
    } else {
      fs.access(file.path, function(accessErr) {
        if (!accessErr) {
          process.nextTick(function() {
            callback(null, stats)
          })
        } else {
          process.nextTick(function() {
            callback(new Issue({ code: 44, file: file }), stats)
          })
        }
      })
    }
  })
}

module.exports = testFile
