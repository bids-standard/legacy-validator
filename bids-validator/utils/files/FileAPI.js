/**
 * Simulates some of the browser File API interface.
 * https://developer.mozilla.org/en-US/docs/Web/API/File
 *
 * @param {string[]} parts - file contents as bytes
 * @param {string} filename - filename without path info
 * @param {Object} properties - unused Blob properties
 */
function NodeFile(parts, filename, properties) {
  this.parts = parts
  this.name = filename
  this.properties = properties
  this.size = parts.reduce(function (a, val) {
    return a + val.length
  }, 0)
  // Unknown defacto mime-type
  this.type = 'application/octet-stream'
  this.lastModified = 0
}

/**
 * Return a either a mock or real FileAPI if one is available
 */
function FileAPI() {
  return typeof File === 'undefined' ? NodeFile : File
}

export default FileAPI
