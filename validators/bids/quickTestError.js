var path = require('path')
var utils = require('../../utils')
var Issue = utils.issues.Issue

/**
 * Generates an error for quickTest failures
 * @param {*} dir directory to generate quickTest error message
 */
function quickTestError(dir) {
  var filename
  if (typeof window === 'undefined') {
    // For Node, grab the path from the dir string
    filename = path.basename(dir)
  } else {
    // Browser side we need to look it up more carefully
    filename = constructFileName(dir)
  }
  var issue = new Issue({
    code: 61,
    file: {
      name: filename,
      path: path.join('.', filename),
      relativePath: path.join('', filename),
    },
  })
  return issue
}

function constructFileName(dir) {
  let filename
  if (dir.length && 'webkitRelativePath' in dir[0]) {
    let wrp = dir[0].webkitRelativePath
    while (wrp.indexOf(path.sep) !== -1) {
      wrp = path.dirname(wrp)
    }
    filename = wrp
  } else {
    // Fallback for non-standard webkitRelativePath
    filename = 'uploaded-directory'
  }
  return filename
}

module.exports = quickTestError
