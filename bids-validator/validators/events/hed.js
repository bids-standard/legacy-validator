import hedValidator from 'hed-validator'
import union from 'lodash/union'
import utils from '../../utils'
import parseTsv from '../tsv/tsvParser'

const Issue = utils.issues.Issue

export default function checkHedStrings(events, jsonContents, jsonFiles, dir) {
  const eventData = constructEventData(events, jsonContents)
  const sidecarData = constructSidecarData(events, jsonContents, jsonFiles)
  const hedDataExists = detectHed(eventData, sidecarData)
  if (!hedDataExists) {
    return Promise.resolve([])
  }
  // New stuff here
  const datasetDescription = jsonContents['/dataset_description.json']
  const datasetDescriptionData = new hedValidator.validator.BidsJsonFile(
    '/dataset_description.json',
    datasetDescription,
    jsonFiles['/dataset_description.json'],
  )
  const dataset = new hedValidator.validator.BidsDataset(
    eventData,
    sidecarData,
    datasetDescriptionData,
    dir,
  )
  // New stuff end does parseHedVersion need to be called anymore?
  const schemaDefinitionIssues = parseHedVersion(jsonContents)
  try {
    return hedValidator.validator
      .validateBidsDataset(dataset)
      .then((hedValidationIssues) => {
        return schemaDefinitionIssues.concat(
          convertHedIssuesToBidsIssues(hedValidationIssues),
        )
      })
  } catch (error) {
    const issues = schemaDefinitionIssues.concat(
      internalHedValidatorIssue(error),
    )
    return Promise.resolve(issues)
  }
}

function constructEventData(events, jsonContents) {
  return events.map((eventFile) => {
    const potentialSidecars = utils.files.potentialLocations(
      eventFile.path.replace('.tsv', '.json'),
    )
    const mergedDictionary = utils.files.generateMergedSidecarDict(
      potentialSidecars,
      jsonContents,
    )
    const parsedTsv = parseTsv(eventFile.contents)
    const file = eventFile.file
    return new hedValidator.validator.BidsEventFile(
      eventFile.path,
      potentialSidecars,
      mergedDictionary,
      parsedTsv,
      file,
    )
  })
}

function constructSidecarData(eventData, jsonContents, jsonFiles) {
  const actualSidecarNames = Object.keys(jsonContents)
  let potentialEventSidecars = []
  for (const eventFileData of eventData) {
    potentialEventSidecars = potentialEventSidecars.concat(
      eventFileData.potentialSidecars,
    )
  }
  const actualEventSidecars = union(actualSidecarNames, potentialEventSidecars)
  return actualEventSidecars.map((sidecarName) => {
    return new hedValidator.validator.BidsSidecar(
      sidecarName,
      jsonContents[sidecarName],
      getSidecarFileObject(sidecarName, jsonFiles),
    )
  })
}

function getSidecarFileObject(sidecarName, jsonFiles) {
  return jsonFiles.filter((file) => {
    return file.relativePath === sidecarName
  })[0]
}

function detectHed(eventData, sidecarData) {
  return (
    sidecarData.some((sidecarFileData) => {
      return Object.values(sidecarFileData.sidecarData).some(sidecarValueHasHed)
    }) ||
    eventData.some((eventFileData) => {
      return eventFileData.parsedTsv.headers.indexOf('HED') !== -1
    })
  )
}

function sidecarValueHasHed(sidecarValue) {
  return (
    sidecarValue !== null &&
    typeof sidecarValue === 'object' &&
    sidecarValue.HED !== undefined
  )
}

function parseHedVersion(jsonContents) {
  const datasetDescription = jsonContents['/dataset_description.json']

  if (!(datasetDescription && datasetDescription.HEDVersion)) {
    return [new Issue({ code: 109 })]
  } else {
    return []
  }
}

function internalHedValidatorIssue(error) {
  return Issue.errorToIssue(error, 107)
}

function convertHedIssuesToBidsIssues(hedIssues) {
  return hedIssues.map((hedIssue) => {
    return new Issue(hedIssue)
  })
}
