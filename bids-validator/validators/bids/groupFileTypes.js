import utils from '../../utils'

const groupFileTypes = (fileList, options) => {
  const files = {
    json: [],
    nifti: [],
    stimuli: [],
    ephys: [],
    tsv: [],
    bval: [],
    bvec: [],
    contRecord: [],
    invalid: [],
    ome: [],
    jpg: [],
    png: [],
    tif: [],
    // used to check all files not already passed through testFile()
    misc: [],
  }
  sortFiles(fileList, options, files)
  return files
}

const sortFiles = (fileList, options, files) => {
  const keys = Object.keys(fileList)
  keys.forEach((key) => {
    const file = fileList[key]
    const filename = file.name
    if (utils.type.file.isStimuliData(file.relativePath)) {
      // collect stimuli
      files.stimuli.push(file)
      files.misc.push(file)
    } else if (!utils.type.isBIDS(file.relativePath)) {
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
    } else if (ephysTest(filename)) {
      // collect ephys
      files.ephys.push(file)
      files.misc.push(file)
    } else if (ofType(filename, 'tsv.gz')) {
      files.contRecord.push(file)
    } else if (ofType(filename, 'ome.tif') || ofType(filename, 'ome.btf')) {
      // collect ome-tiff
      files.ome.push(file)
    } else if (ofType(filename, 'jpg')) {
      // collect jpg
      files.jpg.push(file)
    } else if (ofType(filename, 'png')) {
      // collect png
      files.png.push(file)
    } else if (
      // collect tif
      ofType(filename, 'tif') &&
      !ofType(filename, 'ome.tif') &&
      !ofType(filename, 'ome.btf')
    ) {
      files.tif.push(file)
    } else {
      files.misc.push(file)
    }
  })
}

const ephysTest = (filename) => {
  return [
    'edf',
    'vhdr',
    'vmrk',
    'eeg',
    'bdf',
    'set',
    'fdt',
    'nwb',
    'rdat',
    'ridx',
    'tdat',
    'tidx',
    'tmet',
    'vidx',
    'vmet',
  ].includes(filename.split('.').pop())
}

const ofType = (filename, extension) => {
  const ending = '.' + extension
  return filename && filename.endsWith(ending)
}

export default groupFileTypes
