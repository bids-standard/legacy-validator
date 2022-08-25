import utils from '../utils'
var Issue = utils.issues.Issue

// Match sub-.../... files, except sub-emptyroom
const matchSubjectPath = (file) =>
  file.relativePath.match(/sub-((?!emptyroom).*?)(?=\/)/)

// Helper for filtering unique values in an array
const uniqueArray = (value, index, self) => self.indexOf(value) === index

/**
 * Find unique subjects from FileList
 * @param {object} fileList Browser FileList or Node equivalent
 */
const getFolderSubjects = (fileList) =>
  Object.values(fileList)
    .filter(matchSubjectPath)
    .map((f) => matchSubjectPath(f)[1])
    .filter(uniqueArray)

/**
 * checkAnyDataPresent
 *
 * Takes a list of files and participants with valid data. Checks if they match.
 */
function checkAnyDataPresent(fileList, summarySubjects) {
  var issues = []
  var folderSubjects = getFolderSubjects(fileList)
  var subjectsWithoutAnyValidData = folderSubjects.filter(function (i) {
    return summarySubjects.indexOf(i) < 0
  })

  for (var i = 0; i < subjectsWithoutAnyValidData.length; i++) {
    var missingSubject = subjectsWithoutAnyValidData[i]
    var subFolder = '/sub-' + missingSubject
    issues.push(
      new Issue({
        file: {
          relativePath: subFolder,
          webkitRelativePath: subFolder,
          name: subFolder,
          path: subFolder,
        },
        reason: 'No BIDS compatible data found for subject ' + missingSubject,
        code: 67,
      }),
    )
  }
  return issues
}

export default checkAnyDataPresent
export { getFolderSubjects }
