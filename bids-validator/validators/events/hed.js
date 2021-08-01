import hedValidator from 'hed-validator'
import path from 'path'
import semver from 'semver'
import utils from '../../utils'
import parseTsv from '../tsv/tsvParser'

const Issue = utils.issues.Issue

export default function checkHedStrings(events, jsonContents, jsonFiles, dir) {
  const eventData = getNeededEventData(events)
  const hedDataExists = detectHed(eventData, jsonContents)
  if (!hedDataExists) {
    return Promise.resolve([])
  }
  const [schemaDefinition, schemaDefinitionIssues] = parseHedVersion(
    jsonContents,
    dir,
  )
  let hedSchemaPromise
  try {
    hedSchemaPromise = hedValidator.validator.buildSchema(schemaDefinition)
  } catch (error) {
    return Promise.resolve([internalHedValidatorIssue(error)])
  }
  return hedSchemaPromise.then(hedSchema => {
    return schemaDefinitionIssues.concat(
      extractHed(eventData, jsonContents, jsonFiles, hedSchema),
    )
  })
}

function getNeededEventData(events) {
  return events.map(eventFile => {
    const potentialSidecars = utils.files.potentialLocations(
      eventFile.path.replace('.tsv', '.json'),
    )
    const parsedTsv = parseTsv(eventFile.contents)
    const file = eventFile.file
    return {
      potentialSidecars: potentialSidecars,
      parsedTsv: parsedTsv,
      file: file,
    }
  })
}

function detectHed(eventData, jsonContents) {
  const checkedSidecars = []
  for (const eventFileData of eventData) {
    for (const sidecarName of eventFileData.potentialSidecars) {
      if (checkedSidecars.includes(sidecarName)) {
        continue
      }
      checkedSidecars.push(sidecarName)
      const sidecarDictionary = jsonContents[sidecarName] || {}
      if (Object.values(sidecarDictionary).some(sidecarValueHasHed)) {
        return true
      }
    }
    const hedColumnIndex = eventFileData.parsedTsv.headers.indexOf('HED')
    if (hedColumnIndex !== -1) {
      return true
    }
  }
  return false
}

function parseHedVersion(jsonContents, dir) {
  const schemaDefinition = {}
  const datasetDescription = jsonContents['/dataset_description.json']
  const issues = []

  if (!(datasetDescription && datasetDescription.HEDVersion)) {
    issues.push(new Issue({ code: 109 }))
  } else if (semver.valid(datasetDescription.HEDVersion)) {
    schemaDefinition.version = datasetDescription.HEDVersion
  } else {
    schemaDefinition.path = path.join(
      path.resolve(dir),
      'sourcedata',
      datasetDescription.HEDVersion,
    )
  }

  return [schemaDefinition, issues]
}

let sidecarIssueTypes
let sidecarFileIssues

function extractHed(eventData, jsonContents, jsonFiles, hedSchema) {
  let issues = []
  sidecarIssueTypes = {}
  sidecarFileIssues = {}
  // loop through event data files
  eventData.forEach(eventFileData => {
    let hedStrings = []
    // get the json sidecar dictionary associated with the event data
    const [sidecarErrorsFound, sidecarIssues] = validateSidecars(
      eventFileData.potentialSidecars,
      jsonContents,
      hedSchema,
      jsonFiles,
    )
    if (sidecarErrorsFound) {
      issues = issues.concat(sidecarIssues)
      return
    }
    const sidecarHedTags = mergeSidecarHed(
      eventFileData.potentialSidecars,
      jsonContents,
    )

    const [tsvHedStrings, tsvIssues] = parseTsvHed(
      sidecarHedTags,
      eventFileData,
    )
    hedStrings = tsvHedStrings
    if (!hedStrings) {
      issues = issues.concat(sidecarIssues)
    } else {
      const datasetIssues = validateDataset(
        hedStrings,
        hedSchema,
        eventFileData,
      )
      issues = issues.concat(sidecarIssues, tsvIssues, datasetIssues)
    }
  })
  return issues
}

function validateSidecars(
  potentialSidecars,
  jsonContents,
  hedSchema,
  jsonFiles,
) {
  let issues = []
  let sidecarErrorsFound = false
  // validate the HED strings in the json sidecars
  for (const sidecarName of potentialSidecars) {
    if (!(sidecarName in sidecarIssueTypes)) {
      const sidecarDictionary = jsonContents[sidecarName]
      if (!sidecarDictionary) {
        continue
      }
      const sidecarHedValueStrings = []
      let sidecarHedCategoricalStrings = []
      const sidecarHedData = Object.values(sidecarDictionary).filter(
        sidecarValueHasHed,
      )
      for (const sidecarValue of sidecarHedData) {
        if (typeof sidecarValue.HED === 'string') {
          sidecarHedValueStrings.push(sidecarValue.HED)
        } else {
          sidecarHedCategoricalStrings = sidecarHedCategoricalStrings.concat(
            Object.values(sidecarValue.HED),
          )
        }
      }
      const jsonFileObject = getSidecarFileObject(sidecarName, jsonFiles)
      const [
        valueValidationSucceeded,
        valueStringIssues,
      ] = validateSidecarStrings(
        sidecarHedValueStrings,
        hedSchema,
        jsonFileObject,
        true,
      )
      if (!valueValidationSucceeded) {
        return valueStringIssues
      }
      const [
        categoricalValidationSucceeded,
        categoricalStringIssues,
      ] = validateSidecarStrings(
        sidecarHedCategoricalStrings,
        hedSchema,
        jsonFileObject,
        false,
      )
      if (!categoricalValidationSucceeded) {
        return categoricalStringIssues
      }
      const fileIssues = [].concat(valueStringIssues, categoricalStringIssues)
      if (
        fileIssues.some(fileIssue => {
          return fileIssue.severity === 'error'
        })
      ) {
        sidecarErrorsFound = true
        sidecarIssueTypes[sidecarName] = 'error'
      } else if (fileIssues.length > 0) {
        sidecarIssueTypes[sidecarName] = 'warning'
      }
      issues = issues.concat(fileIssues)
      sidecarFileIssues[sidecarName] = fileIssues
    } else if (sidecarIssueTypes[sidecarName] === 'error') {
      sidecarErrorsFound = true
      issues = issues.concat(sidecarFileIssues[sidecarName])
    }
  }
  return [sidecarErrorsFound, issues]
}

function validateSidecarStrings(
  sidecarHedStrings,
  hedSchema,
  jsonFileObject,
  areValueStrings,
) {
  let sidecarIssues = []
  let isHedStringValid, hedIssues
  for (const hedString of sidecarHedStrings) {
    try {
      ;[isHedStringValid, hedIssues] = hedValidator.validator.validateHedString(
        hedString,
        hedSchema,
        true,
        areValueStrings,
      )
    } catch (error) {
      return [false, internalHedValidatorIssue(error)]
    }
    if (!isHedStringValid) {
      const convertedIssues = convertHedIssuesToBidsIssues(
        hedIssues,
        jsonFileObject,
      )
      sidecarIssues = sidecarIssues.concat(convertedIssues)
    }
  }
  return [true, sidecarIssues]
}

function getSidecarFileObject(sidecarName, jsonFiles) {
  return jsonFiles.filter(file => {
    return file.relativePath === sidecarName
  })[0]
}

function mergeSidecarHed(potentialSidecars, jsonContents) {
  const mergedDictionary = utils.files.generateMergedSidecarDict(
    potentialSidecars,
    jsonContents,
  )

  const sidecarHedTags = {}
  for (const sidecarKey in mergedDictionary) {
    const sidecarValue = mergedDictionary[sidecarKey]
    if (sidecarValueHasHed(sidecarValue)) {
      sidecarHedTags[sidecarKey] = sidecarValue.HED
    }
  }
  return sidecarHedTags
}

function sidecarValueHasHed(sidecarValue) {
  return (
    sidecarValue !== null &&
    typeof sidecarValue === 'object' &&
    sidecarValue.HED !== undefined
  )
}

function parseTsvHed(sidecarHedTags, eventFileData) {
  const hedStrings = []
  const issues = []
  const hedColumnIndex = eventFileData.parsedTsv.headers.indexOf('HED')
  const sidecarHedColumnIndices = {}
  for (const sidecarHedColumn in sidecarHedTags) {
    const sidecarHedColumnHeader = eventFileData.parsedTsv.headers.indexOf(
      sidecarHedColumn,
    )
    if (sidecarHedColumnHeader > -1) {
      sidecarHedColumnIndices[sidecarHedColumn] = sidecarHedColumnHeader
    }
  }
  if (hedColumnIndex === -1 && sidecarHedColumnIndices.length === 0) {
    return [[], []]
  }

  for (const rowCells of eventFileData.parsedTsv.rows.slice(1)) {
    // get the 'HED' field
    const hedStringParts = []
    if (rowCells[hedColumnIndex] && rowCells[hedColumnIndex] !== 'n/a') {
      hedStringParts.push(rowCells[hedColumnIndex])
    }
    for (const sidecarHedColumn in sidecarHedColumnIndices) {
      const sidecarHedIndex = sidecarHedColumnIndices[sidecarHedColumn]
      const sidecarHedData = sidecarHedTags[sidecarHedColumn]
      const rowCell = rowCells[sidecarHedIndex]
      if (rowCell && rowCell !== 'n/a') {
        let sidecarHedString
        if (!sidecarHedData) {
          continue
        }
        if (typeof sidecarHedData === 'string') {
          sidecarHedString = sidecarHedData.replace('#', rowCell)
        } else {
          sidecarHedString = sidecarHedData[rowCell]
        }
        if (sidecarHedString !== undefined) {
          hedStringParts.push(sidecarHedString)
        } else {
          issues.push(
            new Issue({
              code: 108,
              file: eventFileData.file,
              evidence: rowCell,
            }),
          )
        }
      }
    }

    if (hedStringParts.length === 0) {
      continue
    }
    hedStrings.push(hedStringParts.join(','))
  }
  return [hedStrings, issues]
}

function validateDataset(hedStrings, hedSchema, eventFileData) {
  let isHedDatasetValid, hedIssues
  try {
    ;[isHedDatasetValid, hedIssues] = hedValidator.validator.validateHedDataset(
      hedStrings,
      hedSchema,
      true,
    )
  } catch (error) {
    return [internalHedValidatorIssue(error)]
  }
  if (!isHedDatasetValid) {
    const convertedIssues = convertHedIssuesToBidsIssues(
      hedIssues,
      eventFileData.file,
    )
    return convertedIssues
  } else {
    return []
  }
}

function internalHedValidatorIssue(error) {
  return Issue.errorToIssue(error, 107)
}

function convertHedIssuesToBidsIssues(hedIssues, file) {
  const convertedIssues = []
  for (const hedIssue of hedIssues) {
    const issueCode = hedIssue.level === 'warning' ? 105 : 104
    convertedIssues.push(
      new Issue({
        code: issueCode,
        file: file,
        evidence: hedIssue.message,
      }),
    )
  }

  return convertedIssues
}
