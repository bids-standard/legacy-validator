import utils from '../../utils'

const Issue = require('../../utils').issues.Issue

/**
 * ometiff
 *
 * Takes an ometiff file, its omedata as an object
 * and a callback as arguments. Callback
 * with any issues it finds while validating
 * against the BIDS specification.
 */
export default function ometiff(file, omeData, jsonContentsDict, callback) {
  let issues = []

  let mergedDictionary = getMergedDictionary(file, jsonContentsDict)

  // Check for consistency with optional OME-TIFF metadata if present for
  // Immersion, NumericalAperture and Magnification
  let optionalFieldsIssues = checkOptionalFields(
    file.relativePath,
    omeData,
    mergedDictionary,
  )

  // Check for consistency for PixelSize between JSON and OME-TIFF metadata
  let pixelSizeIssues = checkPixelSize(omeData, mergedDictionary)

  issues = issues.concat(optionalFieldsIssues).concat(pixelSizeIssues)

  callback(issues)
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

const getMergedDictionary = (file, jsonContentsDict) => {
  let possibleJsonPath = file.relativePath
    .replace('.tif', '')
    .replace('.ome', '.json')

  let potentialSidecars = utils.files.potentialLocations(possibleJsonPath)

  return utils.files.generateMergedSidecarDict(
    potentialSidecars,
    jsonContentsDict,
  )
}

const checkOptionalFields = (omePath, omeData, jsonData) => {
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

const checkPixelSize = (omeData, jsonData) => {
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

  // if no corresponding json file, skip the consistency check
  if (Object.keys(jsonData).length === 0) return []

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
