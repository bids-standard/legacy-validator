import utils from '../../utils'
const Issue = utils.issues.Issue

const checkJSONAndField = (files, jsonContentsDict, fileList) => {
  let issues = []
  if (files.ome) {
    files.ome.forEach((file) => {
      let possibleJsonPath = file.relativePath
        .replace('.tif', '')
        .replace('.btf', '')
        .replace('.ome', '.json')
      issues = issues.concat(
        ifJsonExist(file, possibleJsonPath, jsonContentsDict, fileList),
      )
    })
  }
  if (files.png) {
    files.png.forEach((file) => {
      let possibleJsonPath = file.relativePath.replace('.png', '.json')
      issues = issues.concat(
        ifJsonExist(file, possibleJsonPath, jsonContentsDict, fileList),
      )
    })
  }
  if (files.tif) {
    files.tif.forEach((file) => {
      let possibleJsonPath = file.relativePath.replace('.tif', '.json')
      issues = issues.concat(
        ifJsonExist(file, possibleJsonPath, jsonContentsDict, fileList),
      )
    })
  }
  if (files.jpg) {
    files.jpg.forEach((file) => {
      let possibleJsonPath = file.relativePath.replace('.jpg', '.json')
      issues = issues.concat(
        ifJsonExist(file, possibleJsonPath, jsonContentsDict, fileList),
      )
    })
  }
  return issues
}

const ifJsonExist = (file, possibleJsonPath, jsonContentsDict, fileList) => {
  let potentialSidecars = utils.files.potentialLocations(possibleJsonPath)
  const chunkRegex = new RegExp('_chunk-[0-9]+')

  const jsonChunkFiles = potentialSidecars.filter(
    (name) => jsonContentsDict.hasOwnProperty(name) && chunkRegex.exec(name),
  )
  const chunkPresent =
    jsonChunkFiles.length || chunkRegex.exec(file.relativePath)

  const mergedDictionary = utils.files.generateMergedSidecarDict(
    potentialSidecars,
    jsonContentsDict,
  )

  if (utils.type.file.isMicroscopyPhoto(file.relativePath)) {
    if (mergedDictionary.hasOwnProperty('IntendedFor')) {
      const intendedFor =
        typeof mergedDictionary['IntendedFor'] == 'string'
          ? [mergedDictionary['IntendedFor']]
          : mergedDictionary['IntendedFor']
      return checkIfIntendedExists(intendedFor, fileList, file)
    }
  } else {
    // check if the given file has a corresponding JSON file
    if (Object.keys(mergedDictionary).length === 0) {
      return [
        new Issue({
          file: file,
          code: 225,
        }),
      ]
    }

    if (chunkPresent) {
      return checkMatrixField(file, mergedDictionary)
    }
  }
  return []
}

const checkMatrixField = (file, mergedDictionary) => {
  let issues = []
  if (!mergedDictionary.hasOwnProperty('ChunkTransformationMatrix')) {
    issues.push(
      new Issue({
        file: file,
        code: 223,
      }),
    )
  }
  return issues
}

const checkIfIntendedExists = (intendedFor, fileList, file) => {
  let issues = []
  for (let key = 0; key < intendedFor.length; key++) {
    const intendedForFile = intendedFor[key]
    const intendedForFileFull =
      '/' + file.relativePath.split('/')[1] + '/' + intendedForFile
    let onTheList = false
    for (let key2 in fileList) {
      if (key2) {
        const filePath = fileList[key2].relativePath
        if (filePath === intendedForFileFull) {
          onTheList = true
        }
      }
    }
    if (!onTheList) {
      issues.push(
        new Issue({
          file: file,
          code: 37,
          reason:
            "'IntendedFor' property of this photo ('" +
            file.relativePath +
            "') does not point to an existing file ('" +
            intendedForFile +
            "'). Please mind that this value should not include subject level directory " +
            "('/" +
            file.relativePath.split('/')[1] +
            "/').",
          evidence: intendedForFile,
        }),
      )
    }
  }
  return issues
}

export default checkJSONAndField
