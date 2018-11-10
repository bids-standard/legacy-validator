// dependencies -------------------------------------------------------------------

const FileAPI = require('./FileAPI')
const newFile = require('./newFile')
const readFile = require('./readFile')
const readNiftiHeader = require('./readNiftiHeader')
const readDir = require('./readDir')
const potentialLocations = require('./potentialLocations')
const generateMergedSidecarDict = require('./generateMergedSidecarDict')
const getBFileContent = require('./getBFileContent')
const collectDirectorySize = require('./collectDirectorySize')
const illegalCharacterTest = require('./illegalCharacterTest')
const sessions = require('./sessions')
const remoteFiles = require('./remoteFiles')

// public API ---------------------------------------------------------------------

var fileUtils = {
  FileAPI,
  newFile,
  readFile,
  readDir,
  readNiftiHeader,
  generateMergedSidecarDict,
  potentialLocations,
  getBFileContent,
  collectDirectorySize,
  illegalCharacterTest,
  sessions,
  remoteFiles,
}

module.exports = fileUtils
