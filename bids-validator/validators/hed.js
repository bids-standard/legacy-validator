import hedValidator from 'hed-validator'
import cloneDeep from 'lodash/cloneDeep'
import intersection from 'lodash/intersection'
import utils from '../utils'

const Issue = utils.issues.Issue

export default function checkHedStrings(tsvs, jsonContents, jsonFiles, dir) {
  const tsvData = constructTsvData(tsvs, jsonContents)
  const sidecarData = constructSidecarData(tsvData, jsonContents, jsonFiles)
  const hedDataExists = detectHed(tsvData, sidecarData)
  if (!hedDataExists) {
    return Promise.resolve([])
  }

  const datasetDescription = jsonContents['/dataset_description.json']
  const datasetDescriptionData = new hedValidator.validator.BidsJsonFile(
    '/dataset_description.json',
    cloneDeep(datasetDescription),
    getSidecarFileObject('/dataset_description.json', jsonFiles),
  )
  const dataset = new hedValidator.validator.BidsDataset(
    tsvData,
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

function constructTsvData(tsvFiles, jsonContents) {
  return tsvFiles.map((tsvFile) => {
    const potentialSidecars = utils.files.potentialLocations(
      tsvFile.file.relativePath.replace('.tsv', '.json'),
    )
    const mergedDictionary = utils.files.generateMergedSidecarDict(
      potentialSidecars,
      jsonContents,
    )
    let TsvFileClass
    if (tsvFile.file.relativePath.endsWith('_events.tsv')) {
      TsvFileClass = hedValidator.bids.BidsEventFile
    } else {
      TsvFileClass = hedValidator.bids.BidsTabularFile
    }
    return new TsvFileClass(
      tsvFile.path,
      potentialSidecars,
      mergedDictionary,
      tsvFile.contents,
      tsvFile.file,
    )
  })
}

function constructSidecarData(tsvData, jsonContents, jsonFiles) {
  const actualSidecarNames = Object.keys(jsonContents)
  const potentialSidecars = []
  for (const tsvFileData of tsvData) {
    potentialSidecars.push(...tsvFileData.potentialSidecars)
  }
  const actualEventSidecars = intersection(
    actualSidecarNames,
    potentialSidecars,
  )
  return actualEventSidecars.map((sidecarName) => {
    return new hedValidator.bids.BidsSidecar(
      sidecarName,
      cloneDeep(jsonContents[sidecarName]),
      getSidecarFileObject(sidecarName, jsonFiles),
    )
  })
}

function getSidecarFileObject(sidecarName, jsonFiles) {
  return cloneDeep(
    jsonFiles.filter((file) => {
      return file.relativePath === sidecarName
    })[0],
  )
}

function detectHed(tsvData, sidecarData) {
  return (
    sidecarData.some((sidecarFileData) => sidecarFileData.hasHedData()) ||
    tsvData.some((tsvFileData) => tsvFileData.hasHedData())
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
