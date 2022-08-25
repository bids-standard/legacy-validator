import json from './json'
import utils from '../../utils'
const Issue = utils.issues.Issue

const validate = (jsonFiles, fileList, jsonContentsDict, summary) => {
  let issues = []
  const jsonValidationPromises = jsonFiles.map(function (file) {
    return utils.limit(
      () =>
        new Promise((resolve) => {
          checkForAccompanyingDataFile(file, fileList, issues)
          json(file, jsonContentsDict, (jsonIssues, jsObj) => {
            issues = issues.concat(jsonIssues)
            collectTaskSummary(file, jsObj, summary)
            return resolve()
          })
        }),
    )
  })

  return new Promise((resolve) =>
    Promise.all(jsonValidationPromises).then(() => resolve(issues)),
  )
}

const collectTaskSummary = (file, jsObj, summary) => {
  // collect task summary
  if (file.name.indexOf('task') > -1) {
    if (
      jsObj &&
      jsObj.TaskName &&
      summary.tasks.indexOf(jsObj.TaskName) === -1
    ) {
      summary.tasks.push(jsObj.TaskName)
    }
  }
}

const checkForAccompanyingDataFile = (file, fileList, issues) => {
  // Verify that the json file has an accompanying data file
  // Need to limit checks to files in sub-*/**/ - Not all data dictionaries are sidecars
  const pathArgs = file.relativePath.split('/')
  const isSidecar =
    pathArgs[1].includes('sub-') && pathArgs.length > 3 ? true : false
  if (isSidecar) {
    // Check for suitable datafile accompanying this sidecar
    const dataFile = utils.bids_files.checkSidecarForDatafiles(file, fileList)
    if (!dataFile) {
      issues.push(
        new Issue({
          code: 90,
          file: file,
        }),
      )
    }
  }
}

export default validate
