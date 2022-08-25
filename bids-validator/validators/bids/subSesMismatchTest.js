import utils from '../../utils'
const Issue = utils.issues.Issue

/**
 * subid and sesid mismatch test. Generates error if ses-id and sub-id are different for any file, Takes a file list and return issues
 */
const subSesMismatchTest = (fileList) => {
  const issues = []

  // validates if sub/ses-id in filename matches with ses/sub directory file is saved
  const fileKeys = Object.keys(fileList)
  fileKeys.forEach((key) => {
    let file = fileList[key]
    if (utils.type.file.isStimuliData(file.relativePath)) {
      return
    }
    const values = getPathandFileValues(file.relativePath)

    const pathValues = values[0]
    const fileValues = values[1]

    if (fileValues.sub !== null || fileValues.ses !== null) {
      const subMismatch = fileValues.sub !== pathValues.sub
      const sesMismatch = fileValues.ses !== pathValues.ses

      if (subMismatch) {
        issues.push(mismatchError('subject', file))
      }

      if (sesMismatch) {
        issues.push(mismatchError('session', file))
      }
    }
  })
  return issues
}

/**
 * getPathandFileValues
 * Takes a file path and returns values
 * found related to subject and session keys for both path and file keys.
 *
 * @param {string} path the string to extract subject and session level values
 */
const getPathandFileValues = (path) => {
  const values = {}
  const file_name = {}

  // capture subject
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
 *
 * @param {string} path path to test regex against
 * @param {regex} regex regex pattern we wish to test
 */
const captureFromPath = (path, regex) => {
  const match = regex.exec(path)
  return match && match[1] ? match[1] : null
}

/**
 *
 * Mismatch Error
 *
 * generates the Issue object for session / subject
 * mismatch
 *
 * @param {string} type error type - session or subject
 * @param {object} file file responsible for the error
 */
const mismatchError = (type, file) => {
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
    evidence: `File: ${file.relativePath} is saved in incorrect ${type} directory as per ${abbrv}-id in filename.`,
    file: file,
  })
}

export default subSesMismatchTest
