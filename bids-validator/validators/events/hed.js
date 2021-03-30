import hedValidator from 'hed-validator'
import path from 'path'
import semver from 'semver'
import utils from '../../utils'
const Issue = utils.issues.Issue

export default function checkHedStrings(events, headers, jsonContents, dir) {
  let issues = []

  const hedStrings = []

  // loop through event data files
  events.forEach(eventFile => {
    // get the json sidecar dictionary associated with the event data
    const potentialSidecars = utils.files.potentialLocations(
      eventFile.path.replace('.tsv', '.json'),
    )
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
              code: 134,
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
      if (rowCells[hedColumnIndex]) {
        hedStringParts.push(rowCells[hedColumnIndex])
      }
      for (const sidecarHedColumn in sidecarHedColumnIndices) {
        const sidecarHedIndex = sidecarHedColumnIndices[sidecarHedColumn]
        const sidecarHedData = sidecarHedTags[sidecarHedColumn]
        const rowCell = rowCells[sidecarHedIndex]
        if (rowCell) {
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
      hedStrings.push([eventFile.file, hedStringParts.join(',')])
    }
  })

  if (hedStrings.length === 0) {
    return Promise.resolve(issues)
  } else {
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
    } else {
      issues.push(new Issue({ code: 132 }))
    }

    // run HED validator
    return hedValidator.validator
      .buildSchema(schemaDefinition)
      .then(hedSchema => {
        for (const [file, hedString] of hedStrings) {
          const [
            isHedStringValid,
            hedIssues,
          ] = hedValidator.validator.validateHedString(
            hedString,
            hedSchema,
            true,
          )
          if (!isHedStringValid) {
            const convertedIssues = convertHedIssuesToBidsIssues(
              hedIssues,
              file,
            )
            issues = issues.concat(convertedIssues)
          }
        }
        return issues
      })
  }
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
    invalidParentNode: 135,
    noValidTagFound: 136,
    emptyTagFound: 137,
    duplicateTagsInSchema: 138,
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
