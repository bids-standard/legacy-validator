const testFile = require('./testFile')
const Issue = require('../../utils/issues').Issue
const fs = require('fs')
const isNode = typeof window === 'undefined'
/**
 * Read
 *
 * A helper method for reading file contents.
 * Takes a file object and a callback and calls
 * the callback with the binary contents of the
 * file as the only argument.
 *
 * In the browser the file should be a file object.
 * In node the file should be a path to a file.
 *
 */
function readFile(file, callback) {
  if (isNode) {
    readNodeFile(file, callback)
  } else {
    readBrowserFile(file, callback)
  }
}

function readNodeFile(file, callback) {
  testFile(file, function(issue) {
    if (issue) {
      process.nextTick(function() {
        callback(issue, null)
      })
      return
    }
    fs.readFile(file.path, 'utf8', function(err, data) {
      process.nextTick(function() {
        callback(null, data)
      })
    })
  })
}

function readBrowserFile(file, callback) {
  var reader = new FileReader()
  reader.onloadend = function(e) {
    if (e.target.readyState == FileReader.DONE) {
      if (!e.target.result) {
        callback(new Issue({ code: 44, file: file }), null)
        return
      }
      callback(null, e.target.result)
    }
  }
  reader.readAsBinaryString(file)
}

module.exports = readFile
