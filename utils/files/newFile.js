const FileAPI = require('./FileAPI')

/**
 * New File
 *
 * Creates an empty File object
 *
 * @param {string} filename - the filename without path info
 */
function newFile(filename) {
  var File = FileAPI()
  return new File([''], filename)
}

module.exports = newFile
