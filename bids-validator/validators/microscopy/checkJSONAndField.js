import utils from '../../utils'
const Issue = utils.issues.Issue

const checkJSONAndField = (files, jsonContentsDict) => {
  let issues = []
  if (files.ome) {
    files.ome.forEach(file => {
      let possibleJsonPath = file.relativePath
        .replace('.tif', '')
        .replace('.btf', '')
        .replace('.ome', '.json')
      issues = issues.concat(
        ifJsonExist(file, possibleJsonPath, jsonContentsDict),
      )
    })
  }
  if (files.png) {
    files.png.forEach(file => {
      if (!file.relativePath.includes('_photo')) {
        let possibleJsonPath = file.relativePath.replace('.png', '.json')
        issues = issues.concat(
          ifJsonExist(file, possibleJsonPath, jsonContentsDict),
        )
      }
    })
  }
  if (files.tif) {
    files.tif.forEach(file => {
      if (!file.relativePath.includes('_photo')) {
        let possibleJsonPath = file.relativePath.replace('.tif', '.json')
        issues = issues.concat(
          ifJsonExist(file, possibleJsonPath, jsonContentsDict),
        )
      }
    })
  }
  return issues
}

const ifJsonExist = (file, possibleJsonPath, jsonContentsDict) => {
  let potentialSidecars = utils.files.potentialLocations(possibleJsonPath)
  const chunkRegex = new RegExp('_chunk-[0-9]+')

  const jsonChunkFiles = potentialSidecars.filter(
    name => jsonContentsDict.hasOwnProperty(name) && chunkRegex.exec(name),
  )
  const chunkPresent =
    jsonChunkFiles.length || chunkRegex.exec(file.relativePath)

  const mergedDictionary = utils.files.generateMergedSidecarDict(
    potentialSidecars,
    jsonContentsDict,
  )

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

export default checkJSONAndField
