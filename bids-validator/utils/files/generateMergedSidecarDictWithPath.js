/**
 * Generate Merged Sidecar Dictionary
 *
 * Takes an array of potential sidecards and a
 * master object dictionary of all JSON file
 * content and returns a merged dictionary
 * containing all values from the potential
 * sidecars and the sidecarName
 */
function generateMergedSidecarDictWithPath(potentialSidecars, jsonContents) {
  let mergedDictionary = {}
  potentialSidecars.map(sidecarName => {
    const jsonObject = jsonContents[sidecarName]
    if (jsonObject) {
      mergedDictionary['sidecarName'] = sidecarName
      for (var key in jsonObject) {
        mergedDictionary[key] = jsonObject[key]
      }
    } else if (jsonObject === null) {
      mergedDictionary.invalid = true
    }
  })
  return mergedDictionary
}

export default generateMergedSidecarDictWithPath
