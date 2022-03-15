// dependencies -------------------------------------------------------------------
import FileAPI from './FileAPI'

import newFile from './newFile'
import readFile from './readFile'
import readOMEFile from './readOMEFile'
import readBuffer from './readBuffer'
import readNiftiHeader from './readNiftiHeader'
import readDir from './readDir'
import potentialLocations from './potentialLocations'
import generateMergedSidecarDict from './generateMergedSidecarDict'
import getBFileContent from './getBFileContent'
import collectDirectorySize from './collectDirectorySize'
import illegalCharacterTest from './illegalCharacterTest'
import sessions from './sessions'
import remoteFiles from './remoteFiles'
import getFileStats from './getFileStats'

// public API ---------------------------------------------------------------------

export default {
  FileAPI,
  newFile,
  readFile,
  readDir,
  readBuffer,
  readOMEFile,
  readNiftiHeader,
  generateMergedSidecarDict,
  potentialLocations,
  getBFileContent,
  collectDirectorySize,
  illegalCharacterTest,
  sessions,
  remoteFiles,
  getFileStats,
}
