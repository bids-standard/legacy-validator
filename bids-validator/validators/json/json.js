import utils from '../../utils'
import Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true })
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
ajv.addSchema(require('./schemas/common_definitions.json'))
const Issue = utils.issues.Issue

/**
 * JSON
 *
 * Takes a JSON file as a string and a callback
 * as arguments. And callsback with any errors
 * it finds while validating against the BIDS
 * specification.
 */
export default function (file, jsonContentsDict, callback) {
  // primary flow --------------------------------------------------------------------
  let issues = []
  const potentialSidecars = utils.files.potentialLocations(file.relativePath)
  const mergedDictionary = utils.files.generateMergedSidecarDict(
    potentialSidecars,
    jsonContentsDict,
  )
  if (mergedDictionary) {
    issues = issues.concat(checkUnits(file, mergedDictionary))
    issues = issues.concat(compareSidecarProperties(file, mergedDictionary))
  }
  callback(issues, mergedDictionary)
}

// individual checks ---------------------------------------------------------------

function checkUnits(file, sidecar) {
  let issues = []
  const schema = selectSchema(file)
  issues = issues.concat(validateSchema(file, sidecar, schema))

  issues = issues.concat(
    checkSidecarUnits(file, sidecar, { field: 'RepetitionTime', min: 100 }, 2),
  )

  issues = issues.concat(
    checkSidecarUnits(file, sidecar, { field: 'EchoTime', min: 1 }, 3),
  )
  issues = issues.concat(
    checkSidecarUnits(file, sidecar, { field: 'EchoTime1', min: 1 }, 4),
  )
  issues = issues.concat(
    checkSidecarUnits(file, sidecar, { field: 'EchoTime2', min: 1 }, 4),
  )
  issues = issues.concat(
    checkSidecarUnits(file, sidecar, { field: 'TotalReadoutTime', min: 10 }, 5),
  )

  return issues
}

const compareSidecarProperties = (file, sidecar) => {
  const issues = []

  // check that EffectiveEchoSpacing < TotalReadoutTime
  if (
    sidecar.hasOwnProperty('TotalReadoutTime') &&
    sidecar.hasOwnProperty('EffectiveEchoSpacing') &&
    sidecar['TotalReadoutTime'] < sidecar['EffectiveEchoSpacing']
  ) {
    issues.push(
      new Issue({
        file: file,
        code: 93,
      }),
    )
  }
  return issues
}

const selectSchema = (file) => {
  let schema = null
  if (file.name) {
    if (file.name.endsWith('participants.json')) {
      schema = require('./schemas/data_dictionary.json')
    } else if (
      file.name.endsWith('bold.json') ||
      file.name.endsWith('sbref.json')
    ) {
      schema = require('./schemas/bold.json')
    } else if (file.name.endsWith('asl.json')) {
      schema = require('./schemas/asl.json')
    } else if (file.name.endsWith('pet.json')) {
      schema = require('./schemas/pet.json')
    } else if (file.relativePath === '/dataset_description.json') {
      schema = require('./schemas/dataset_description.json')
    } else if (file.name.endsWith('meg.json')) {
      schema = require('./schemas/meg.json')
    } else if (file.name.endsWith('ieeg.json')) {
      schema = require('./schemas/ieeg.json')
    } else if (file.name.endsWith('eeg.json')) {
      schema = require('./schemas/eeg.json')
    } else if (
      file.name.endsWith('TEM.json') ||
      file.name.endsWith('SEM.json') ||
      file.name.endsWith('uCT.json') ||
      file.name.endsWith('BF.json') ||
      file.name.endsWith('DF.json') ||
      file.name.endsWith('PC.json') ||
      file.name.endsWith('DIC.json') ||
      file.name.endsWith('FLUO.json') ||
      file.name.endsWith('CONF.json') ||
      file.name.endsWith('PLI.json') ||
      file.name.endsWith('CARS.json') ||
      file.name.endsWith('2PE.json') ||
      file.name.endsWith('MPE.json') ||
      file.name.endsWith('SR.json') ||
      file.name.endsWith('NLO.json') ||
      file.name.endsWith('OCT.json') ||
      file.name.endsWith('SPIM.json')
    ) {
      schema = require('./schemas/microscopy.json')
    } else if (
      file.relativePath.includes('/micr') &&
      file.name.endsWith('photo.json')
    ) {
      schema = require('./schemas/microscopy_photo.json')
    } else if (
      file.relativePath.includes('/meg/') &&
      file.name.endsWith('coordsystem.json')
    ) {
      schema = require('./schemas/coordsystem_meg.json')
    } else if (
      file.relativePath.includes('/ieeg/') &&
      file.name.endsWith('coordsystem.json')
    ) {
      schema = require('./schemas/coordsystem_ieeg.json')
    } else if (
      file.relativePath.includes('/eeg/') &&
      file.name.endsWith('coordsystem.json')
    ) {
      schema = require('./schemas/coordsystem_eeg.json')
    } else if (
      file.relativePath.includes('/pet/') &&
      file.name.endsWith('blood.json')
    ) {
      schema = require('./schemas/pet_blood.json')
    } else if (file.name.endsWith('genetic_info.json')) {
      schema = require('./schemas/genetic_info.json')
    } else if (
      file.name.endsWith('physio.json') ||
      file.name.endsWith('stim.json')
    ) {
      schema = require('./schemas/physio.json')
    } else if (file.name.endsWith('events.json')) {
      schema = require('./schemas/events.json')
    } else if (file.name.endsWith('beh.json')) {
      schema = require('./schemas/beh.json')
    }
  }
  return schema
}

const validateSchema = (file, sidecar, schema) => {
  const issues = []
  if (schema) {
    const validate = ajv.compile(schema)
    const valid = validate(sidecar)
    if (!valid) {
      validate.errors.map((error) =>
        issues.push(
          new Issue({
            file: file,
            code: 55,
            evidence: error.dataPath + ' ' + error.message,
          }),
        ),
      )
    }
  }
  return issues
}

const checkSidecarUnits = (file, sidecar, fieldObj, errCode) => {
  const issues = []
  const field = fieldObj.field
  const min = fieldObj.min
  if (sidecar.hasOwnProperty(field) && sidecar[field] > min) {
    issues.push(
      new Issue({
        code: errCode,
        file: file,
      }),
    )
  }
  return issues
}
