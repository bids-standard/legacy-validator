var utils = require('../utils')
var Issue = utils.issues.Issue

/**
 * session
 *
 * Takes a list of files and creates a set of file names that occur in subject
 * directories. Then generates a warning if a given subject is missing any
 * files from the set.
 */
const session = function missingSessionFiles(fileList) {
  const subjects = {}
  const sessions = []
  const issues = []
  const sessionMatcher = new RegExp('(ses-.*?)/')

  for (let key in fileList) {
    if (fileList.hasOwnProperty(key)) {
      const file = fileList[key]
      let filename

      if (!file || (typeof window != 'undefined' && !file.webkitRelativePath)) {
        continue
      }

      const path = file.relativePath
      if (!utils.type.isBIDS(path) || utils.type.file.isStimuliData(path)) {
        continue
      }
      let subject
      //match the subject identifier up to the '/' in the full path to a file.
      const match = path.match(/sub-(.*?)(?=\/)/)
      if (match === null) {
        continue
      } else {
        subject = match[0]
      }

      // suppress inconsistent subject warnings for sub-emptyroom scans
      // in MEG data
      if (subject == 'sub-emptyroom') {
        continue
      }

      // initialize a subject object if we haven't seen this subject before
      if (typeof subjects[subject] === 'undefined') {
        subjects[subject] = {
          files: [],
          sessions: [],
          missingSessions: []
        }
      }
      // files are prepended with subject name, the following two commands
      // remove the subject from the file name to allow filenames to be more
      // easily compared
      filename = path.substring(path.match(subject).index + subject.length)
      filename = filename.replace(subject, '<sub>')
      subjects[subject].files.push(filename)
      
      const sessionMatch = filename.match(sessionMatcher)
      if(sessionMatch) {
        // extract session name
        const sessionName = sessionMatch[1]
        // add session to sessions if not already there
        if(!sessions.includes(sessionName)) {
          sessions.push(sessionName)
        }
        if(!subjects[subject].sessions.includes(sessionName))
        subjects[subject].sessions.push(sessionName)
      }
    }
  }

  const subject_files = []
  for (let subjKey in subjects) {
    if (subjects.hasOwnProperty(subjKey)) {
      const subject = subjects[subjKey]

      // push warning to issues if missing session
      if (sessions.length > 0) {
        sessions.forEach(commonSession => {
          if(!subject.sessions.includes(commonSession)) {
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
                reason: 'A session is missing from one subject that is present in at least one other subject',
                evidence: `Subject: ${subjKey}; Missing session: ${commonSession}`,
                code: 97,
              }),
            )
          }
        })
      }


      // add files to subject_files if not already listed
      for (var i = 0; i < subject.files.length; i++) {
        const file = subject.files[i]
        if (subject_files.indexOf(file) < 0) {
          subject_files.push(file)
        }
      }
    }
  }
  
  var subjectKeys = Object.keys(subjects).sort()
  // for each subject
  for (var j = 0; j < subjectKeys.length; j++) {
    const subject = subjectKeys[j]

    // for each file per subject
    for (var i = 0; i < subject_files.length; i++) {
      const filePath = subject_files[i]
      let fileSession, fileInMissingSession
      const sessionMatch = filePath.match(sessionMatcher)

      // if sessions are in use, extract session name from file
      // and test if 
      if (sessionMatch) {
        fileSession = sessionMatch[1]
        fileInMissingSession = subjects[subject].missingSessions.includes(fileSession)
      } else {
        fileInMissingSession = false
      }

      if(!fileInMissingSession) {
        const subjectMissingFile = subjects[subject].files.indexOf(filePath) === -1
  
        if (subjectMissingFile) {
          var fileThatsMissing =
            '/' + subject + filePath.replace('<sub>', subject)
          const fileName = fileThatsMissing.substr(
            fileThatsMissing.lastIndexOf('/') + 1,
          )
          issues.push(
            new Issue({
              file: {
                relativePath: fileThatsMissing,
                webkitRelativePath: fileThatsMissing,
                name: fileName,
                path: fileThatsMissing,
              },
              evidence: `Subject: ${subject}; Missing file: ${fileName}`,
              reason:
                'This file is missing for subject ' +
                subject +
                ', but is present for at least one other subject.',
              code: 38,
            }),
          )
        }
      }
    }
  }
  return issues
}

module.exports = session
