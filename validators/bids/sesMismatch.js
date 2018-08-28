var async = require('async')
var Issue = require('../../utils').issues.Issue

/**
 * subid and sesid mismatch test. Generates error if ses-id and sub-id are different for any file, Takes a file list and return issues
 */
function mismatchTest(BIDS, fileList) {
  var self = BIDS
  var mismatch = false

  // validates if sub/ses-id in filename matches with ses/sub directory file is saved
  async.eachOfLimit(fileList, 200, function(file) {
    var values = getPathandFileValues(file.relativePath)

    var pathValues = values[0]
    var fileValues = values[1]

    if (fileValues.sub !== null || fileValues.ses !== null) {
      const sub_mismatch = fileValues.sub !== pathValues.sub
      const ses_mismatch = fileValues.ses !== pathValues.ses

      if (sub_mismatch) {
        mismatch = true
        self.issues.push(mismatchError('subject', file))
      }

      if (ses_mismatch) {
        mismatch = true
        self.issues.push(mismatchError('session', file))
      }
    }
  })
  return mismatch
}

/**
 * getPathandFileValues
 * Takes a file path and returns values
 * found following keys for both path and file keys.
 * sub-
 * ses-
 */
function getPathandFileValues(path) {
  let values = {}
  let file_name = {}

  // capture sub
  values.sub = captureFromPath(path, /^\/sub-([a-zA-Z0-9]+)/)

  // capture session
  values.ses = captureFromPath(path, /^\/sub-[a-zA-Z0-9]+\/ses-([a-zA-Z0-9]+)/)

  //capture session and subject id from filename to find if files are in
  // correct sub/ses directory
  const filename = path.replace(/^.*[\\/]/, '')

  // capture sub from file name
  file_name.sub = captureFromPath(filename, /^sub-([a-zA-Z0-9]+)/)

  // capture session from file name
  file_name.ses = captureFromPath(
    filename,
    /^sub-[a-zA-Z0-9]+_ses-([a-zA-Z0-9]+)/,
  )

  return [values, file_name]
}

/**
 * CaptureFromPath
 *
 * takes a file path and a regex and
 * returns the matched value or null
 */
function captureFromPath(path, regex) {
  const match = regex.exec(path)
  return match && match[1] ? match[1] : null
}

function mismatchError(type, file) {
  let code, abbrv
  if (type == 'session') {
    code = 65
    abbrv = 'ses'
  } else {
    code = 64
    abbrv = 'sub'
  }
  return new Issue({
    code: code,
    evidence: `File: ${
      file.relativePath
    } is saved in incorrect ${type} directory as per ${abbrv}-id in filename.`,
    file: file,
  })
}

module.exports = mismatchTest
