/**
 * Utility functions for checking bids file structures
 * eg. corresponding files
 */
// dependencies -------------------------------------------------------------------
import type from './type.js'

// implementations ----------------------------------------------------------------
/**
 * Verify that JSON sidecars have corresponding data files
 */
function checkSidecarForDatafiles(file, fileList) {
  const noExt = file.relativePath.replace('.json', '')
  const dictName = noExt.substring(noExt.lastIndexOf('/') + 1, noExt.length)
  const args = {
    dictArgs: dictName.split('_'),
    dictName: dictName,
    dictPath: noExt.substring(0, noExt.lastIndexOf('/') + 1),
    file: file,
    fileList: fileList,
    noExt: noExt,
  }
  const idxs = Object.keys(fileList)
  // Check each file in fileList for potential match - return true on first match
  let dataFile = idxs.some(checkFileListForMatch, args)
  return dataFile
}

/**
 * Check file list for first valid match for sidecar file
 */
function checkFileListForMatch(i) {
  this.path = this.fileList[i].relativePath
  let match = false
  // Only check file if path includes the path to sidecar
  const dictArgs = this.path.includes(this.dictPath) ? this.dictArgs : []
  // Set true if dictArgs and all dictargs exist in file path (except 'coordsystem')
  let pathMatch =
    dictArgs.length > 0
      ? dictArgs.every(
          (arg) => arg === 'coordsystem' || this.path.includes(arg),
        )
      : false
  if (pathMatch) {
    match = verifyDatafileMatch(
      this.file.relativePath,
      this.noExt,
      this.fileList[i],
    )
  }
  return match
}

/**
 * Accepts path to sidecar file, the sidecar filename without extension
 * and the datafile that's a potential match
 * Returns boolean indicating if file evaluates as valid datafile
 */
function verifyDatafileMatch(sidecarPath, noExt, matchFile) {
  let match = false
  let folderMatch = false

  // Make sure it's not the data dictionary itself
  const isSelf = matchFile.relativePath === sidecarPath
  if (!isSelf && type.file.isDatafile(matchFile.relativePath)) {
    match = true
  }

  // IEEG and MEG datafiles may be a folder, therefore not contained in fileList, will need to look in paths
  if (!isSelf && !match) {
    if (noExt.endsWith('_meg') || noExt.endsWith('_coordsystem')) {
      folderMatch = matchFile.relativePath.includes('_meg.ds')
    }
    if (noExt.endsWith('_ieeg') || noExt.endsWith('_coordsystem')) {
      folderMatch = matchFile.relativePath.includes('_ieeg.mefd')
    }
  }
  if (folderMatch) {
    match = true
  }

  return match
}

export { checkSidecarForDatafiles }

export default {
  checkSidecarForDatafiles,
}
