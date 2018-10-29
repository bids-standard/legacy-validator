var utils = require('../utils')
const sesUtils = utils.files.sessions
var Issue = utils.issues.Issue

/**
 * session
 *
 * Takes a list of files and creates a set of file names that occur in subject
 * directories. Then generates a warning if a given subject is missing any
 * files from the set.
 */
const session = function missingSessionFiles(fileList) {
  const issues = []
  const { subjects, sessions } = getDataOrganization(fileList)

  issues.push(...missingSessionWarnings(subjects, sessions))

  const subject_files = getSubjectFiles(subjects)
  issues.push(...missingFileWarnings(subjects, subject_files))

  return issues
}

/**
 * getDataOrganization
 *
 * takes a list of files and returns a dictionary of subjects and a list of sessions
 */
function getDataOrganization(fileList) {
  const subjects = {}
  const sessions = []

  for (let key in fileList) {
    if (fileList.hasOwnProperty(key)) {
      const file = fileList[key]

      if (!file || (typeof window != 'undefined' && !file.webkitRelativePath))
        continue

      const path = file.relativePath
      if (!utils.type.isBIDS(path) || utils.type.file.isStimuliData(path))
        continue

      //match the subject identifier up to the '/' in the full path to a file.
      let subjKey
      const match = path.match(/sub-(.*?)(?=\/)/)
      if (match === null) continue
      else subjKey = match[0]

      // suppress inconsistent subject warnings for sub-emptyroom scans
      // in MEG data
      if (subjKey == 'sub-emptyroom') continue

      // initialize a subject object if we haven't seen this subject before
      subjects[subjKey] = subjects[subjKey] || new sesUtils.Subject()

      let filename = getFilename(path, subjKey)
      subjects[subjKey].files.push(filename)

      const sessionMatch = filename.match(sesUtils.sessionMatcher)
      if (sessionMatch) {
        // extract session name
        const sessionName = sessionMatch[1]
        // add session to sessions if not already there
        if (!sessions.includes(sessionName)) {
          sessions.push(sessionName)
        }
        if (!subjects[subjKey].sessions.includes(sessionName))
          subjects[subjKey].sessions.push(sessionName)
      }
    }
  }

  return { subjects, sessions }
}

/**
 * getFilename
 *
 * takes a filepath and a subject key and
 * returns file name
 */
function getFilename(path, subjKey) {
  // files are prepended with subject name, the following two commands
  // remove the subject from the file name to allow filenames to be more
  // easily compared
  let filename = path.substring(path.match(subjKey).index + subjKey.length)
  filename = filename.replace(subjKey, '<sub>')
  return filename
}

/**
 * missingSessionWarnings
 *
 * take subjects and sessions
 * pushes missing session warnings to issues list
 * and returns issues
 */
function missingSessionWarnings(subjects, sessions) {
  const issues = []
  for (let subjKey in subjects) {
    if (subjects.hasOwnProperty(subjKey)) {
      const subject = subjects[subjKey]

      // push warning to issues if missing session
      if (sessions.length > 0) {
        sessions.forEach(commonSession => {
          if (!subject.sessions.includes(commonSession)) {
            subject.missingSessions.push(commonSession)
            const path = `/${subjKey}/${commonSession}`
            issues.push(
              new Issue({
                file: {
                  relativePath: path,
                  webkitRelativePath: path,
                  name: commonSession,
                  path,
                },
                reason:
                  'A session is missing from one subject that is present in at least one other subject',
                evidence: `Subject: ${subjKey}; Missing session: ${commonSession}`,
                code: 97,
              }),
            )
          }
        })
      }
    }
  }
  return issues
}

/**
 * getSubjectFiles
 *
 * takes a list of subjects and returns a list of each file
 */

function getSubjectFiles(subjects) {
  const subject_files = []
  for (let subjKey in subjects) {
    if (subjects.hasOwnProperty(subjKey)) {
      const subject = subjects[subjKey]

      // add files to subject_files if not already listed
      subject.files.forEach(file => {
        if (subject_files.indexOf(file) < 0) {
          subject_files.push(file)
        }
      })
    }
  }
  return subject_files
}

/**
 * missingFileWarnings
 *
 * takes a list of subjects and a list of common files and
 * generates an issue for each file missing from each subject
 * returns list of issues
 */
function missingFileWarnings(subjects, subject_files) {
  const issues = []
  var subjectKeys = Object.keys(subjects).sort()
  subjectKeys.forEach(subjKey => {
    subject_files.forEach(filename => {
      const fileInMissingSession = checkFileInMissingSession(
        filename,
        subjects[subjKey],
      )

      if (!fileInMissingSession) {
        const missingFileWarning = checkMissingFile(
          subjects[subjKey],
          subjKey,
          filename,
        )
        if (missingFileWarning) issues.push(missingFileWarning)
      }
    })
  })
  return issues
}

/**
 * checkFileInMissingSession
 *
 * takes a file(path) and the subject object it should belong to and
 * returns whether or not the file is in a missing session
 */
function checkFileInMissingSession(filePath, subject) {
  let fileSession
  const sessionMatch = filePath.match(sesUtils.sessionMatcher)

  // if sessions are in use, extract session name from file
  // and test if
  if (sessionMatch) {
    fileSession = sessionMatch[1]
    return subject.missingSessions.includes(fileSession)
  } else {
    return false
  }
}

/**
 * checkMissingFile
 *
 * takes a list of subjects, the subject key, and the expected file and
 * returns an issue if the file is missing
 */
function checkMissingFile(subject, subjKey, filename) {
  const subjectMissingFile = subject.files.indexOf(filename) === -1

  if (subjectMissingFile) {
    var fileThatsMissing = '/' + subjKey + filename.replace('<sub>', subjKey)
    const fileName = fileThatsMissing.substr(
      fileThatsMissing.lastIndexOf('/') + 1,
    )
    return new Issue({
      file: {
        relativePath: fileThatsMissing,
        webkitRelativePath: fileThatsMissing,
        name: fileName,
        path: fileThatsMissing,
      },
      evidence: `Subject: ${subjKey}; Missing file: ${fileName}`,
      reason:
        'This file is missing for subject ' +
        subjKey +
        ', but is present for at least one other subject.',
      code: 38,
    })
  }
}

module.exports = {
  session,
  getDataOrganization,
  getFilename,
  missingSessionWarnings,
  getSubjectFiles,
  missingFileWarnings,
  checkFileInMissingSession,
  checkMissingFile,
}
