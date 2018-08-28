/**
 * Get B-File Contents
 *
 * Takes an array of potential bval or bvec files
 * and a master b-file contents dictionary and returns
 * the contents of the desired file.
 */
function getBFileContent(potentialBFiles, bContentsDict) {
  for (var i = 0; i < potentialBFiles.length; i++) {
    var potentialBFile = potentialBFiles[i]
    if (bContentsDict.hasOwnProperty(potentialBFile)) {
      return bContentsDict[potentialBFile]
    }
  }
}

module.exports = getBFileContent
