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
const remoteFiles = require('./remoteFiles')

// public API ---------------------------------------------------------------------

var fileUtils = {
  FileAPI: FileAPI,
  newFile: newFile,
  readFile: readFile,
  readDir: readDir,
  readNiftiHeader: readNiftiHeader,
  generateMergedSidecarDict: generateMergedSidecarDict,
  potentialLocations: potentialLocations,
  getBFileContent: getBFileContent,
  collectDirectorySize: collectDirectorySize,
  illegalCharacterTest: illegalCharacterTest,
  remoteFiles: remoteFiles,
}

module.exports = fileUtils
