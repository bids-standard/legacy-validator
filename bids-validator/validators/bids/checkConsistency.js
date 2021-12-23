import utils from '../../utils'
import isNode from '../../utils/isNode'
import ExifReader from 'exifreader'
const xml2js = require('xml2js')
const Issue = require('../../utils').issues.Issue

const getOMETiffData = async omeFile => {
  let tags
  if (isNode) {
    tags = await ExifReader.load(omeFile.path)
  } else {
    const arrayBuffer = await toArrayBuffer(omeFile)
    tags = await ExifReader.load(arrayBuffer)
  }
  let xml = tags['ImageDescription']['description']
  let parser = new xml2js.Parser()
  return await parser.parseStringPromise(xml)
}

const toArrayBuffer = async file => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = event => {
        resolve(event.target.result)
      }

      reader.readAsArrayBuffer(file)
    } catch (e) {
      reject(e)
    }
  })
}

const convertFactor = (omeUnit, jsonUnit) => {
  if (omeUnit === jsonUnit || (omeUnit === 'µm' && jsonUnit === 'um')) return 1

  if (jsonUnit === 'um') {
    if (omeUnit === 'mm') {
      return 1000
    } else if (omeUnit === 'nm') {
      return 0.001
    }
  } else if (jsonUnit === 'mm') {
    if (omeUnit === 'µm') {
      return 0.001
    } else if (omeUnit === 'nm') {
      return 0.000001
    }
  } else if (jsonUnit === 'nm') {
    if (omeUnit === 'mm') {
      return 1000000
    } else if (omeUnit === 'µm') {
      return 1000
    }
  }
}

const getMatchingComponents = (omeFiles, jsonContentsDict) => {
  let components = []
  omeFiles.forEach(omeFile => {
    let possibleJsonPath = omeFile.relativePath
      .replace('.tif', '')
      .replace('.ome', '.json')

    let potentialSidecars = utils.files.potentialLocations(possibleJsonPath)

    const mergedDictionary = utils.files.generateMergedSidecarDict(
      potentialSidecars,
      jsonContentsDict,
    )

    components.push({
      omeFile: omeFile,
      jsonData: mergedDictionary,
    })
  })

  return components
}

const checkConsistency = (omeFiles, jsonContentsDict) => {
  let issues = []

  let components = getMatchingComponents(omeFiles, jsonContentsDict)

  // if at least one ome-tiff file has no corresponding json file
  if (components.length !== omeFiles.length) {
    issues.push(new Issue({ code: 223 }))
  }

  const omeIssuesPromises = components.map(component => {
    return utils.limit(
      () =>
        new Promise(async resolve => {
          let jsonData = component.jsonData
          let omeData = await getOMETiffData(component.omeFile)
          let optionalFieldsIssues = await validateOptionalFields(
            component.omeFile.relativePath,
            omeData,
            jsonData,
          )
          let pixelSizeIssues = await validatePixelSize(omeData, jsonData)
          issues = issues.concat(optionalFieldsIssues).concat(pixelSizeIssues)
          return resolve()
        }),
    )
  })

  return new Promise(resolve =>
    Promise.all(omeIssuesPromises).then(() => resolve(issues)),
  )
}

const validateOptionalFields = async (omePath, omeData, jsonData) => {
  let issues = []

  let fields = {
    Immersion: 'Immersion',
    NumericalAperture: 'LensNA',
    Magnification: 'NominalMagnification',
  }

  if (
    omeData['OME']['Instrument'] &&
    omeData['OME']['Instrument'][0]['Objective']
  ) {
    let objective = omeData['OME']['Instrument'][0]['Objective'][0]['$']
    for (let field in fields) {
      let property = fields[field]
      if (jsonData.hasOwnProperty(field) && objective[property]) {
        if (objective[property] != jsonData[field]) {
          issues.push(
            new Issue({
              file: {
                relativePath: omePath,
                path: omePath,
              },
              evidence: `JSON field '${field}' is inconsistent`,
              code: 224,
            }),
          )
        }
      }
    }
  }

  return issues
}

const validateChunkTransformationMatrix = (
  jsonFilePath,
  omeFilePath,
  jsonData,
) => {
  let issues = []

  /*if chunk-<index> is used either in the filenames of 
    ome-tiff or JSON files, 'ChunkTransformationMatrix' is recommended*/
  let regex = new RegExp('_chunk-[a-zA-Z0-9]+')

  if (regex.exec(jsonFilePath) || regex.exec(omeFilePath)) {
    if (!jsonData.hasOwnProperty('ChunkTransformationMatrix')) {
      issues.push(new Issue({ code: 223 }))
    }
  }

  return issues
}

const validatePixelSize = async (omeData, jsonData) => {
  let issues = []
  let validUnits = ['um', 'µm', 'nm', 'mm']

  const PhysicalSizeX =
    omeData['OME']['Image'][0]['Pixels'][0]['$']['PhysicalSizeX']
  const physicalSizeXUnit =
    omeData['OME']['Image'][0]['Pixels'][0]['$']['PhysicalSizeXUnit']
  const PhysicalSizeY =
    omeData['OME']['Image'][0]['Pixels'][0]['$']['PhysicalSizeY']
  const physicalSizeYUnit =
    omeData['OME']['Image'][0]['Pixels'][0]['$']['PhysicalSizeYUnit']
  const PhysicalSizeZ =
    omeData['OME']['Image'][0]['Pixels'][0]['$']['PhysicalSizeZ']
  const physicalSizeZUnit =
    omeData['OME']['Image'][0]['Pixels'][0]['$']['PhysicalSizeZUnit']

  // if no corresponding json file
  if (Object.keys(jsonData).length === 0) issues.push(new Issue({ code: 225 }))

  let unitsPendToCheck = [
    physicalSizeXUnit,
    physicalSizeYUnit,
    physicalSizeZUnit,
  ]

  unitsPendToCheck.forEach(unit => {
    if (!validUnits.includes(unit)) {
      issues.push(new Issue({ code: 222 }))
    }
  })

  // if any physicalSizeUnit is not valid or no valid json file, skip the consistency check
  if (issues.length > 0) return issues

  let pixelSize = jsonData['PixelSize']
  let physicalSizeUnit = jsonData['PixelSizeUnits']

  let factorX = convertFactor(physicalSizeXUnit, physicalSizeUnit)
  let factorY = convertFactor(physicalSizeYUnit, physicalSizeUnit)
  let factorZ = convertFactor(physicalSizeZUnit, physicalSizeUnit)

  if (
    PhysicalSizeX * factorX !== pixelSize[0] ||
    PhysicalSizeY * factorY !== pixelSize[1] ||
    PhysicalSizeZ * factorZ !== pixelSize[2]
  ) {
    issues.push(new Issue({ code: 221 }))
  }

  return issues
}
export default checkConsistency
