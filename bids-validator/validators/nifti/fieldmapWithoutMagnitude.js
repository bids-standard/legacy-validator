const Issue = require('../../utils').issues.Issue

const fieldmapWithoutMagnitude = (files) => {
  // Check for _fieldmap nifti exists without corresponding _magnitude
  const issues = []
  const niftiNames = files.map((nifti) => nifti.name)
  const fieldmaps = niftiNames.filter(
    (nifti) => nifti.indexOf('_fieldmap') > -1,
  )
  const magnitudes = niftiNames.filter(
    (nifti) => nifti.indexOf('_magnitude') > -1,
  )
  fieldmaps.map((nifti) => {
    const associatedMagnitudeFile = nifti.replace('fieldmap', 'magnitude')
    if (magnitudes.indexOf(associatedMagnitudeFile) === -1) {
      issues.push(
        new Issue({
          code: 91,
          file: files.find((niftiFile) => niftiFile.name == nifti),
        }),
      )
    }
  })
  return issues
}

export default fieldmapWithoutMagnitude
