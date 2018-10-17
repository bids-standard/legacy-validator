const utils = require('../../utils')
const Issue = utils.issues.Issue
const nonCustomColumns = require('../../bids_validator/tsv/non_custom_columns.json')

/**
 * @param {Object} file - BIDS file object
 * Accepts file object and returns a type based on file path
 */
const getTsvType = function(file) {
  let tsvType = 'misc'
  if (file.relativePath.includes('phenotype/')) {
    tsvType = 'phenotype'
  } else if (file.name === 'participants.tsv') {
    tsvType = 'participants'
  } else if (
    file.name.endsWith('_channels.tsv') ||
    file.name.endsWith('_events.tsv') ||
    file.name.endsWith('_scans.tsv') ||
    file.name.endsWith('_sessions.tsv')
  ) {
    const split = file.name.split('_')
    tsvType = split[split.length - 1].replace('.tsv', '')
  }
  return tsvType
}

/**
 *
 * @param {array} headers -Array of column names
 * @param {string} type - Type from getTsvType
 * Checks TSV column names to determine if they're core or custom
 * Returns array of custom column names
 */
const getCustomColumns = function(headers, type) {
  const customCols = []
  // Iterate column headers
  for (let col of headers) {
    // If it's a custom column
    if (!nonCustomColumns[type].includes(col)) {
      customCols.push(col)
    }
  }
  return customCols
}

/**
 *
 * @param {array} tsvs - Array of objects containing TSV file objects and contents
 * @param {Object} jsonContentsDict
 */
const validateTsvColumns = function(tsvs, jsonContentsDict) {
  const tsvIssues = []
  tsvs.map(tsv => {
    const customColumns = getCustomColumns(
      tsv.contents
        .split('\n')[0]
        .trim()
        .split('\t'),
      getTsvType(tsv.file),
    )
    if (customColumns.length > 0) {
      // Get merged data dictionary for this file
      const potentialSidecars = utils.files.potentialLocations(
        tsv.file.relativePath.replace('.tsv', '.json'),
      )
      const mergedDict = utils.files.generateMergedSidecarDict(
        potentialSidecars,
        jsonContentsDict,
      )
      const keys = Object.keys(mergedDict)
      // Gather undefined columns for the file
      const undefinedCols = customColumns.filter(col => !keys.includes(col))
      // Create an issue for all undefined columns in this file
      undefinedCols.length &&
        tsvIssues.push(
          customColumnIssue(
            tsv.file,
            undefinedCols.join(', '),
            potentialSidecars,
          ),
        )
    }
  })
  // Return array of all instances of undescribed custom columns
  return tsvIssues
}

const customColumnIssue = function(file, col, locations) {
  return new Issue({
    code: 82,
    file: file,
    evidence:
      'Columns: ' +
      col +
      ' not defined, please define in: ' +
      locations.toString().replace(',', ', '),
  })
}

module.exports = validateTsvColumns
