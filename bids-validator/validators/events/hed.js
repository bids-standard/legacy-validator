import hedValidator from 'hed-validator'
import path from 'path'
import semver from 'semver'
import utils from '../../utils'
const Issue = utils.issues.Issue

export default function checkHedStrings(events, headers, jsonContents, dir) {
  let issues = []

  // find specified version in sidecar
  const schemaDefinition = {}
  const datasetDescription = jsonContents['/dataset_description.json']

  if (datasetDescription && datasetDescription.HEDVersion) {
    if (semver.valid(datasetDescription.HEDVersion)) {
      schemaDefinition.version = datasetDescription.HEDVersion
    } else {
      schemaDefinition.path = path.join(
        path.resolve(dir),
        'sourcedata',
        datasetDescription.HEDVersion,
      )
    }
  }

  // run HED validator
  return hedValidator.validator
    .buildSchema(schemaDefinition)
    .then(hedSchema => {
      let hedStringsFound = false
      const sidecarIssueTypes = {}
      let sidecarErrorsFound = false
      // loop through event data files
      events.forEach(eventFile => {
        const hedStrings = []
        // get the json sidecar dictionary associated with the event data
        const potentialSidecars = utils.files.potentialLocations(
          eventFile.path.replace('.tsv', '.json'),
        )
        // validate the HED strings in the json sidecars
        for (const sidecarName of potentialSidecars) {
          if (!(sidecarName in sidecarIssueTypes)) {
            const sidecarDictionary = jsonContents[sidecarName]
            let sidecarHedStrings = []
            for (const sidecarKey in sidecarDictionary) {
              const sidecarValue = sidecarDictionary[sidecarKey]
              if (
                sidecarValue !== null &&
                typeof sidecarValue === 'object' &&
                sidecarValue.HED !== undefined
              ) {
                if (typeof sidecarValue.HED === 'string') {
                  sidecarHedStrings.push(sidecarValue.HED)
                } else {
                  sidecarHedStrings = sidecarHedStrings.concat(
                    Object.values(sidecarValue.HED),
                  )
                }
              }
            }
            let fileIssues = []
            for (const hedString of sidecarHedStrings) {
              const [
                isHedStringValid,
                hedIssues,
              ] = hedValidator.validator.validateHedString(
                hedString,
                hedSchema,
                true,
                true,
              )
              if (!isHedStringValid) {
                const convertedIssues = convertHedIssuesToBidsIssues(
                  hedIssues,
                  eventFile.file,
                )
                fileIssues = fileIssues.concat(convertedIssues)
              }
            }
            if (fileIssues.length > 0) {
              let fileErrorsFound = false
              for (const fileIssue of fileIssues) {
                if (fileIssue.severity === 'error') {
                  fileErrorsFound = true
                  sidecarErrorsFound = true
                  break
                }
              }
              if (fileErrorsFound) {
                issues.push(
                  new Issue({
                    code: 209,
                    file: eventFile.file,
                    evidence: sidecarName,
                  }),
                )
                sidecarIssueTypes[sidecarName] = 'error'
              } else {
                issues.push(
                  new Issue({
                    code: 210,
                    file: eventFile.file,
                    evidence: sidecarName,
                  }),
                )
                sidecarIssueTypes[sidecarName] = 'warning'
              }
              issues = issues.concat(fileIssues)
            }
          } else if (sidecarIssueTypes[sidecarName] === 'error') {
            sidecarErrorsFound = true
          }
        }
        if (sidecarErrorsFound) {
          return
        }
        const mergedDictionary = utils.files.generateMergedSidecarDict(
          potentialSidecars,
          jsonContents,
        )

        const sidecarHedTags = {}
        for (const sidecarKey in mergedDictionary) {
          const sidecarValue = mergedDictionary[sidecarKey]
          if (
            sidecarValue !== null &&
            typeof sidecarValue === 'object' &&
            sidecarValue.HED !== undefined
          ) {
            const sidecarHedData = sidecarValue.HED
            if (
              typeof sidecarHedData === 'string' &&
              sidecarHedData.split('#').length !== 2
            ) {
              issues.push(
                new Issue({
                  code: 203,
                  file: eventFile.file,
                  evidence: sidecarHedData,
                }),
              )
              sidecarHedTags[sidecarKey] = false
            } else {
              sidecarHedTags[sidecarKey] = sidecarHedData
            }
          }
        }

        // get all non-empty rows
        const rows = eventFile.contents
          .split('\n')
          .filter(row => !(!row || /^\s*$/.test(row)))

        const columnHeaders = rows[0].trim().split('\t')
        const hedColumnIndex = columnHeaders.indexOf('HED')
        const sidecarHedColumnIndices = {}
        for (const sidecarHedColumn in sidecarHedTags) {
          const sidecarHedColumnHeader = columnHeaders.indexOf(sidecarHedColumn)
          if (sidecarHedColumnHeader > -1) {
            sidecarHedColumnIndices[sidecarHedColumn] = sidecarHedColumnHeader
          }
        }
        if (hedColumnIndex === -1 && sidecarHedColumnIndices.length === 0) {
          return
        }

        for (const row of rows.slice(1)) {
          // get the 'HED' field
          const rowCells = row.trim().split('\t')
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
                    code: 112,
                    file: eventFile.file,
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

        if (hedStrings.length > 0) {
          hedStringsFound = true
        }

        const [
          isHedDatasetValid,
          hedIssues,
        ] = hedValidator.validator.validateHedDataset(
          hedStrings,
          hedSchema,
          true,
        )
        if (!isHedDatasetValid) {
          const convertedIssues = convertHedIssuesToBidsIssues(
            hedIssues,
            eventFile.file,
          )
          issues = issues.concat(convertedIssues)
        }
      })
      if (hedStringsFound && Object.entries(schemaDefinition).length === 0) {
        issues.push(new Issue({ code: 132 }))
      }
      return issues
    })
}

function convertHedIssuesToBidsIssues(hedIssues, file) {
  const hedIssuesToBidsCodes = {
    invalidCharacter: 106,
    parentheses: 107,
    commaMissing: 108,
    capitalization: 109,
    duplicateTag: 110,
    tooManyTildes: 111,
    extraDelimiter: 115,
    invalidTag: 116,
    multipleUniqueTags: 117,
    childRequired: 118,
    requiredPrefixMissing: 119,
    unitClassDefaultUsed: 120,
    unitClassInvalidUnit: 121,
    extraCommaOrInvalid: 122,
    invalidParentNode: 204,
    noValidTagFound: 205,
    emptyTagFound: 206,
    duplicateTagsInSchema: 207,
    extension: 208,
  }

  const convertedIssues = []
  for (const hedIssue of hedIssues) {
    const bidsIssueCode = hedIssuesToBidsCodes[hedIssue.code]
    if (bidsIssueCode === undefined) {
      if (hedIssue.message.startsWith('WARNING')) {
        convertedIssues.push(
          new Issue({
            code: 105,
            file: file,
            evidence: hedIssue.message,
          }),
        )
      } else {
        convertedIssues.push(
          new Issue({
            code: 104,
            file: file,
            evidence: hedIssue.message,
          }),
        )
      }
    } else {
      convertedIssues.push(
        new Issue({
          code: bidsIssueCode,
          file: file,
          evidence: hedIssue.message,
        }),
      )
    }
  }

  return convertedIssues
}
