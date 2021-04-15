import utils from '../../utils'
import Ajv from 'ajv'
const ajv = new Ajv({ allErrors: true })
import JSONSchemaDraft from 'ajv/lib/refs/json-schema-draft-06.json'
ajv.addMetaSchema(JSONSchemaDraft)
import commonDefinitionsSchema from './schemas/common_definitions.json'
ajv.addSchema(commonDefinitionsSchema)
const Issue = utils.issues.Issue

/**
 * JSON
 *
 * Takes a JSON file as a string and a callback
 * as arguments. And callsback with any errors
 * it finds while validating against the BIDS
 * specification.
 */
export default async function(file, jsonContentsDict, callback) {
  // primary flow --------------------------------------------------------------------
  let issues = []
  const potentialSidecars = utils.files.potentialLocations(file.relativePath)
  const mergedDictionary = utils.files.generateMergedSidecarDict(
    potentialSidecars,
    jsonContentsDict,
  )
  if (mergedDictionary) {
    issues = issues.concat(await checkUnits(file, mergedDictionary))
    issues = issues.concat(compareSidecarProperties(file, mergedDictionary))
  }
  callback(issues, mergedDictionary)
}

// individual checks ---------------------------------------------------------------

async function checkUnits(file, sidecar) {
  let issues = []
  const schema = await selectSchema(file)
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

const importSchema = async filepath => (await import(filepath)).default

const selectSchema = async file => {
  let schema = null
  if (file.name) {
    if (file.name.endsWith('participants.json')) {
      schema = await importSchema('./schemas/data_dictionary.json')
    } else if (
      file.name.endsWith('bold.json') ||
      file.name.endsWith('sbref.json')
    ) {
      schema = await importSchema('./schemas/bold.json')
    } else if (file.name.endsWith('asl.json')) {
      schema = await importSchema('./schemas/asl.json')
    } else if (file.name.endsWith('pet.json')) {
      schema = await importSchema('./schemas/pet.json')
    } else if (file.relativePath === '/dataset_description.json') {
      schema = await importSchema('./schemas/dataset_description.json')
    } else if (file.name.endsWith('meg.json')) {
      schema = await importSchema('./schemas/meg.json')
    } else if (file.name.endsWith('ieeg.json')) {
      schema = await importSchema('./schemas/ieeg.json')
    } else if (file.name.endsWith('eeg.json')) {
      schema = await importSchema('./schemas/eeg.json')
    } else if (
      file.relativePath.includes('/meg/') &&
      file.name.endsWith('coordsystem.json')
    ) {
      schema = await importSchema('./schemas/coordsystem_meg.json')
    } else if (
      file.relativePath.includes('/ieeg/') &&
      file.name.endsWith('coordsystem.json')
    ) {
      schema = await importSchema('./schemas/coordsystem_ieeg.json')
    } else if (
      file.relativePath.includes('/eeg/') &&
      file.name.endsWith('coordsystem.json')
    ) {
      schema = await importSchema('./schemas/coordsystem_eeg.json')
    } else if (
      file.relativePath.includes('/pet/') &&
      file.name.endsWith('blood.json')
    ) {
      schema = await importSchema('./schemas/pet_blood.json')
    } else if (file.name.endsWith('genetic_info.json')) {
      schema = await importSchema('./schemas/genetic_info.json')
    } else if (
      file.name.endsWith('physio.json') ||
      file.name.endsWith('stim.json')
    ) {
      schema = await importSchema('./schemas/physio.json')
    } else if (file.name.endsWith('events.json')) {
      schema = await importSchema('./schemas/events.json')
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
      validate.errors.map(error =>
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
