const Issue = require('../../utils').issues.Issue

/**
 * Checks status column in a electroencephalography _channels.tsv file to
 * ensure its values are only * 'good', 'bad', or 'n/a'
 * @param {string[]} rows - Each row of a tsv file to be checked.
 * @param {Object} file - File of rows being checked, used for error message if
 *     problem is found.
 * @param {Object[]} issues - Array of issue objects to add to if problem is
 *     found.
 * @returns {null} Results of this function are stored in issues.
 */
const checkStatusCol = function (rows, file, issues) {
  const header = rows[0]
  const statusColumn = header.indexOf('status')
  if (statusColumn !== -1) {
    for (let i = 1; i < rows.length; i++) {
      const line = rows[i]
      const status = line[statusColumn]
      if (status !== 'good' && status !== 'bad' && status != 'n/a') {
        issues.push(
          new Issue({
            file: file,
            evidence: line.toString(),
            line: i + 1,
            reason:
              'the status column values should either be good, bad, or n/a',
            code: 125,
          }),
        )
      }
    }
  }
  return
}

export default checkStatusCol
