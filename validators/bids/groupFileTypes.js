const utils = require('../../utils')

const groupFileTypes = (fileList, options) => {
  const files = {
    json: [],
    nifti: [],
    stimuli: [],
    ephys: [],
    tsv: [],
    bval: [],
    bvec: [],
    invalid: [],
    // used to check all files not already passed through testFile()
    misc: [],
  }
  sortFiles(fileList, options, files)
  return files
}

const sortFiles = (fileList, options, files) => {
  const keys = Object.keys(fileList)
  keys.forEach(key => {
    const file = fileList[key]
    const filename = file.name
    if (utils.type.file.isStimuliData(file.relativePath)) {
      // collect stimuli
      files.stimuli.push(file)
      files.misc.push(file)
    } else if (
      !utils.type.isBIDS(file.relativePath, options.bep006, options.bep010)
    ) {
      // invalid file type
      files.invalid.push(file)
      files.misc.push(file)
    } else if (ofType(filename, 'nii') || ofType(filename, 'nii.gz')) {
      // collect niftis
      files.nifti.push(file)
    } else if (ofType(filename, 'json')) {
      // collect json
      files.json.push(file)
    } else if (ofType(filename, 'tsv')) {
      // collect tsv
      files.tsv.push(file)
    } else if (ofType(filename, 'bval')) {
      // collect bval
      files.bval.push(file)
    } else if (ofType(filename, 'bvec')) {
      // collect bvec
      files.bvec.push(file)
    } else if (ieegTest(filename)) {
      // collect ephys
      files.ephys.push(file)
      files.misc.push(file)
    } else {
      files.misc.push(file)
    }
  })
}

const ieegTest = filename => {
  return [
    'edf',
    'vhdr',
    'vmrk',
    'eeg',
    'cnt',
    'bdf',
    'set',
    'fdt',
    'nwb',
    'mef',
  ].includes(filename.split('.').pop())
}

const ofType = (filename, extension) => {
  const ending = '.' + extension
  return filename && filename.endsWith(ending)
}

module.exports = groupFileTypes
