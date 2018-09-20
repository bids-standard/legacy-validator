const utils = require('../../utils')
const nifti = require('./nii')
const phaseDiffWithoutMagnitude = require('./phasediffWithoutMagnitude')
const fieldmapWithoutMagnitude = require('./fieldmapWithoutMagnitude')
const duplicateFiles = require('./duplicateFiles')

const validate = (
  files,
  fileList,
  options,
  jsonContentsDict,
  bContentsDict,
  events,
  headers,
  annexed,
  dir,
) => {
  let issues = []
  const niftiPromises = files.map(function(file) {
    return new Promise(resolve => {
      if (options.ignoreNiftiHeaders) {
        nifti(
          null,
          file,
          jsonContentsDict,
          bContentsDict,
          fileList,
          events,
          function(niftiIssues) {
            // console.log('niftiIssues.length:', niftiIssues.length)
            // console.log('squirt')
            issues = issues.concat(niftiIssues)
            resolve()
          },
        )
      } else {
        utils.files.readNiftiHeader(
          file,
          function(header) {
            // check if header could be read
            if (header && header.hasOwnProperty('error')) {
              issues.push(header.error)
              resolve()
            } else {
              headers.push([file, header])
              nifti(
                header,
                file,
                jsonContentsDict,
                bContentsDict,
                fileList,
                events,
                function(niftiIssues) {
                  issues = issues.concat(niftiIssues)
                  resolve()
                },
              )
            }
          },
          annexed,
          dir,
        )
      }
    })
  })

  return new Promise(resolve => {
    // check for duplicate nifti files
    const duplicateNiftisIssues = duplicateFiles(files)
    issues = issues.concat(duplicateNiftisIssues)

    // Check for _fieldmap nifti exists without corresponding _magnitude
    const magnitudeIssues = fieldmapWithoutMagnitude(files)
    issues = issues.concat(magnitudeIssues)

    // phase diff without magnitude test
    const phaseDiffWithoutMagnitudeIssues = phaseDiffWithoutMagnitude(files)
    issues = issues.concat(phaseDiffWithoutMagnitudeIssues)

    Promise.all(niftiPromises).then(() => resolve(issues))
  })
}

module.exports = validate
