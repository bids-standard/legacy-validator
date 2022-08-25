import type from '../type'

/**
 * Collect all datatype suffixes for files that match a supported modality
 **/
export const collectDataTypes = (filenames) => {
  const datatypes = []
  for (const path of filenames) {
    const pathParts = path.split('_')
    const suffix = pathParts[pathParts.length - 1]

    // check modality by data file extension ...
    // and capture data files for later sanity checks (when available)
    if (type.file.hasModality(path)) {
      // collect modality summary
      const dataType = suffix.slice(0, suffix.indexOf('.'))
      if (datatypes.indexOf(dataType) === -1) {
        datatypes.push(dataType)
      }
    }
  }
  return datatypes
}

export default collectDataTypes
