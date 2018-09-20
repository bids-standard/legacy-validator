const fs = require('fs')
const Issue = require('../../utils/issues').Issue
const remoteFiles = require('./remoteFiles')

/**
 * Test File
 *
 * Takes a file and callback and tests if it's viable for
 * reading. Calls back with an error and stats if it isn't
 * or null and stats if it is.
 */
function testFile(file, callback, annexed, dir) {
  fs.stat(file.path, function(statErr, stats) {
    if (statErr) {
      fs.lstat(file.path, function(lstatErr, lstats) {
        if (lstatErr) {
          callback(new Issue({ code: 44, file: file }), stats)
        } else if (lstats && lstats.isSymbolicLink()) {
          if (annexed) {
            // Set byte retrieval limits based on file type
            const limit = file.name.includes('.nii') ? 500 : false
            // Call process to get remote files
            // It will call callback with content or error
            remoteFiles.getAnnexedFile(file, dir, callback, limit)
          } else {
            callback(new Issue({ code: 43, file: file }), stats)
          }
        } else {
          callback(new Issue({ code: 44, file: file }), stats)
        }
      })
    } else {
      fs.access(file.path, function(accessErr) {
        handleFsAccess(accessErr, callback, stats)
      })
    }
  })
}

function handleFsAccess(accessErr, callback, stats) {
  if (!accessErr) {
    process.nextTick(function() {
      callback(null, stats)
    })
  } else {
    process.nextTick(function() {
      callback(new Issue({ code: 44, file: file }), stats)
    })
  }
}

module.exports = testFile
