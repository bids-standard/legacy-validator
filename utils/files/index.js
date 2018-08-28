// dependencies -------------------------------------------------------------------

const FileAPI = require('./FileAPI')
const newFile = require('./newFile')
const readFile = require('./readFile')
const readNiftiHeader = require('./readNiftiHeader')
const readDir = require('./readDir')
const potentialLocations = require('./potentialLocations')
const generateMergedSidecarDict = require('./generatedMergedSidecarDict')
const getBFileContent = require('./getBFileContent')
const collectDirectoryStatistics = require('./collectDirectoryStatistics')
const illegalCharacterTest = require('./illegalCharacterTest')

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
  collectDirectoryStatistics: collectDirectoryStatistics,
  illegalCharacterTest: illegalCharacterTest,
}

module.exports = fileUtils
