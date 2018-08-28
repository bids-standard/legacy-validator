var utils = require('../utils')
var Ajv = require('ajv')
var ajv = new Ajv({ allErrors: true })
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
var Issue = utils.issues.Issue

/**
 * JSON
 *
 * Takes a JSON file as a string and a callback
 * as arguments. And callsback with any errors
 * it finds while validating against the BIDS
 * specification.
 */
module.exports = function(file, contents, callback) {
  // primary flow --------------------------------------------------------------------

  var issues = []
  utils.json.parse(file, contents, function(pissues, jsObj) {
    issues = pissues
    if (jsObj) {
      issues = issues.concat(checkUnits(file, jsObj))
    }
    return callback(issues, jsObj)
  })
}

// individual checks ---------------------------------------------------------------

function checkUnits(file, sidecar) {
  let issues = []
  let schema = selectSchema(file)
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

function selectSchema(file) {
  let schema = null
  if (file.name) {
    if (file.name.endsWith('participants.json')) {
      schema = require('./schemas/data_dictionary.json')
    } else if (
      file.name.endsWith('bold.json') ||
      file.name.endsWith('sbref.json')
    ) {
      schema = require('./schemas/bold.json')
    } else if (file.relativePath === '/dataset_description.json') {
      schema = require('./schemas/dataset_description.json')
    } else if (file.name.endsWith('meg.json')) {
      schema = require('./schemas/meg.json')
    } else if (file.name.endsWith('ieeg.json')) {
      schema = require('./schemas/ieeg.json')
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
    } else if (file.name.endsWith('eeg.json')) {
      schema = require('./schemas/eeg.json')
    }
  }
  return schema
}

function validateSchema(file, sidecar, schema) {
  const issues = []
  if (schema) {
    var validate = ajv.compile(schema)
    var valid = validate(sidecar)
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

function checkSidecarUnits(file, sidecar, fieldObj, errCode) {
  let issues = []
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
