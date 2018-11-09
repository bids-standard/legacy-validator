const fs = require('fs')
const Issue = require('../../utils/issues').Issue

/**
 * Test File
 *
 * Takes a file and callback and tests if it's viable for
 * reading and is larger than 0 kb. Calls back with an error and stats if it isn't
 * or null and stats if it is.
 */
function testFile(file) {
  return new Promise(resolve => {
    fs.stat(file.path, function(statErr, stats) {
      if (statErr) {
        fs.lstat(file.path, function(lstatErr, lstats) {
          if (lstatErr) {
            resolve({ issue: new Issue({ code: 44, file: file }), stats })
          } else if (lstats && lstats.isSymbolicLink()) {
            resolve({ issue: new Issue({ code: 43, file: file }), stats })
          } else {
            resolve({ issue: new Issue({ code: 44, file: file }), stats })
          }
        })
      } else {
        fs.access(file.path, function(accessErr) {
          if (!accessErr) {
            process.nextTick(function() {
              if (stats.size === 0) {
                resolve({
                  issue: new Issue({
                    code: 97,
                    file: file,
                    reason: `Empty files (${file.path}) not allowed.`,
                  }),
                })
              }
              resolve({ issue: null, stats })
            })
          } else {
            process.nextTick(function() {
              resolve({ issue: new Issue({ code: 44, file: file }), stats })
            })
          }
        })
      }
    })
  })
}

module.exports = testFile
