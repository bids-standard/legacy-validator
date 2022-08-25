const Issue = require('../../utils').issues.Issue

const phasediffWithoutMagnitude = (files) => {
  // check to see if each phasediff is associated with magnitude
  const issues = []
  const niftiNames = files.map((nifti) => nifti.name)
  const phaseDiffNiftis = niftiNames.filter(
    (nifti) => nifti.indexOf('phasediff') > -1,
  )
  const magnitude1Niftis = niftiNames.filter(
    (nifti) => nifti.indexOf('magnitude1') > -1,
  )
  phaseDiffNiftis.map((nifti) => {
    const associatedMagnitudeFile = nifti.replace('phasediff', 'magnitude1')
    if (magnitude1Niftis.indexOf(associatedMagnitudeFile) === -1) {
      issues.push(
        new Issue({
          code: 92,
          file: files.find((niftiFile) => niftiFile.name == nifti),
        }),
      )
    }
  })
  return issues
}

export default phasediffWithoutMagnitude
