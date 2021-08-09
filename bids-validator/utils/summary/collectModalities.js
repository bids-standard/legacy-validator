import type from '../type'

export const collectModalities = filenames => {
  const modalities = {
    MRI: 0,
    PET: 0,
    MEG: 0,
    EEG: 0,
    iEEG: 0,
    Microscopy: 0,
  }
  const secondary = {
    MRI_Diffusion: 0,
    MRI_Structural: 0,
    MRI_Functional: 0,
    MRI_Perfusion: 0,
    PET_Static: 0,
    PET_Dynamic: 0,
    iEEG_ECoG: 0,
    iEEG_SEEG: 0,
  }
  for (const path of filenames) {
    // MRI files
    if (type.file.isAnat(path)) {
      modalities.MRI++
      secondary.MRI_Structural++
    }
    if (type.file.isDWI(path)) {
      modalities.MRI++
      secondary.MRI_Diffusion++
    }
    if (type.file.isAsl(path)) {
      modalities.MRI++
      secondary.MRI_Perfusion++
    }
    if (type.file.isFunc(path) || type.file.isFuncBold(path)) {
      modalities.MRI++
      secondary.MRI_Functional++
    }
    if (type.file.isFieldMap(path)) {
      modalities.MRI++
    }
    if (type.file.isPET(path) || type.file.isPETBlood(path)) {
      modalities.PET++
      if (path.match('rec-acstat') || path.match('rec-nacstat')) {
        secondary.PET_Static++
      } else if (path.match('rec-acdyn') || path.match('rec-nacdyn')) {
        secondary.PET_Dynamic++
      }
    }
    if (type.file.isMeg(path)) {
      modalities.MEG++
    }
    if (type.file.isEEG(path)) {
      modalities.EEG++
    }
    if (type.file.isIEEG(path)) {
      modalities.iEEG++
    }
    if (type.file.isMicroscopy(path)) {
      modalities.Microscopy++
    }
  }
  // Order by matching file count
  const nonZero = Object.keys(modalities).filter(a => modalities[a] !== 0)
  if (nonZero.length === 0) {
    return { primary: [], secondary: [] }
  }
  const sortedModalities = nonZero.sort((a, b) => {
    if (modalities[b] === modalities[a]) {
      // On a tie, hand it to the non-MRI modality
      if (b === 'MRI') {
        return -1
      } else {
        return 0
      }
    }
    return modalities[b] - modalities[a]
  })
  const nonZeroSecondary = Object.keys(secondary).filter(
    a => secondary[a] !== 0,
  )
  const sortedSecondary = nonZeroSecondary.sort(
    (a, b) => secondary[b] - secondary[a],
  )
  return { primary: sortedModalities, secondary: sortedSecondary }
}

export default collectModalities
