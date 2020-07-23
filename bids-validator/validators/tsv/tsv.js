import utils from '../../utils'
import Issue from '../../utils/issues/issue'
import checkAcqTimeFormat from './checkAcqTimeFormat'
import checkAge89 from './checkAge89'
import checkStatusCol from './checkStatusCol'
import checkTypecol from './checkTypeCol'
import parseTSV from './tsvParser'
var path = require('path')

/**
 * Format TSV headers for evidence string
 * @param {Array[string]} headers
 * @returns {string}
 */
const headersEvidence = headers => `Column headers: ${headers.join(', ')}`

/**
 * Format TSV filename for evidence string
 * @param {Array[string]} filename
 * @returns {string}
 */
const filenameEvidence = filename => `Filename: ${filename}`

/**
 * TSV
 *
 * Takes a TSV file as a string and a callback
 * as arguments. And callsback with any issues
 * it finds while validating against the BIDS
 * specification.
 */

const TSV = (file, contents, fileList, callback) => {
  const issues = []
  const stimPaths = []
  if (contents.includes('\r') && !contents.includes('\n')) {
    issues.push(
      new Issue({
        file: file,
        evidence: contents,
        code: 70,
      }),
    )
    callback(issues, null)
    return
  }

  // TSV Parser -----------------------------------------------------------
  const { headers, rows } = parseTSV(contents)

  // generic checks -----------------------------------------------------------
  let columnMismatch = false
  let emptyCells = false
  let NACells = false

  for (let i = 0; i < rows.length; i++) {
    const values = rows[i]
    const evidence = `row ${i}: ${values.join('\t')}`
    if (values.length === 1 && /^\s*$/.test(values[0])) continue
    if (columnMismatch && emptyCells && NACells) break
    // check for different length rows
    if (values.length !== headers.length && !columnMismatch) {
      columnMismatch = true
      issues.push(
        new Issue({
          file: file,
          evidence,
          line: i + 1,
          code: 22,
        }),
      )
    }
    // iterate values
    for (let j = 0; j < values.length; j++) {
      const value = values[j]
      if (columnMismatch && emptyCells && NACells) break
      if (value === '' && !emptyCells) {
        emptyCells = true
        // empty cell should raise an error
        issues.push(
          new Issue({
            file: file,
            evidence,
            line: i + 1,
            reason: 'Missing value at column # ' + (j + 1),
            code: 23,
          }),
        )
      } else if (
        (value === 'NA' ||
          value === 'na' ||
          value === 'nan' ||
          value === 'NaN') &&
        !NACells
      ) {
        NACells = true
        // check if missing value is properly labeled as 'n/a'
        issues.push(
          new Issue({
            file: file,
            evidence,
            line: i + 1,
            reason: 'Missing value at column # ' + (j + 1),
            code: 24,
          }),
        )
      }
    }
  }

  // specific file checks -----------------------------------------------------
  const checkheader = function checkheader(headername, idx, file, code) {
    if (headers[idx] !== headername) {
      issues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          character: rows[0].indexOf(headers[idx]),
          code: code,
        }),
      )
    }
  }

  // events.tsv
  if (file.name.endsWith('_events.tsv')) {
    if (headers.length == 0 || headers[0] !== 'onset') {
      issues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          code: 20,
        }),
      )
    }
    if (headers.length < 2 || headers[1].trim() !== 'duration') {
      issues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          code: 21,
        }),
      )
    }

    // create full dataset path list
    const pathList = []
    for (let f in fileList) {
      pathList.push(fileList[f].relativePath)
    }

    // check for stimuli file
    const stimFiles = []
    if (headers.indexOf('stim_file') > -1) {
      for (let k = 0; k < rows.length; k++) {
        const stimFile = rows[k][headers.indexOf('stim_file')]
        const stimPath = '/stimuli/' + stimFile
        if (
          stimFile &&
          stimFile !== 'n/a' &&
          stimFile !== 'stim_file' &&
          stimFiles.indexOf(stimFile) == -1
        ) {
          stimFiles.push(stimFile)
          stimPaths.push(stimPath)
          if (pathList.indexOf(stimPath) == -1) {
            issues.push(
              new Issue({
                file: file,
                evidence: stimFile,
                reason:
                  'A stimulus file (' +
                  stimFile +
                  ') was declared but not found in /stimuli.',
                line: k + 1,
                character: rows[k].indexOf(stimFile),
                code: 52,
              }),
            )
          }
        }
      }
    }
  }

  // participants.tsv
  let participants = null
  if (
    file.name === 'participants.tsv' ||
    file.relativePath.includes('phenotype/')
  ) {
    const participantIdColumn = headers.indexOf('participant_id')
    if (participantIdColumn === -1) {
      issues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          code: 48,
        }),
      )
    } else {
      participants = []
      for (let l = 1; l < rows.length; l++) {
        const row = rows[l]
        // skip empty rows
        if (!row || /^\s*$/.test(row)) {
          continue
        }
        const participant = row[participantIdColumn].replace('sub-', '')
        if (participant == 'emptyroom') {
          continue
        }
        participants.push(participant)
      }
    }
  }

  if (
    file.relativePath.includes('/meg/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    checkheader('name', 0, file, 71)
    checkheader('type', 1, file, 71)
    checkheader('units', 2, file, 71)
    checkStatusCol(rows, file, issues)
    checkTypecol(rows, file, issues)
  }

  if (
    file.relativePath.includes('/eeg/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    checkheader('name', 0, file, 71)
    checkheader('type', 1, file, 71)
    checkheader('units', 2, file, 71)
    checkStatusCol(rows, file, issues)
    checkTypecol(rows, file, issues)
  }

  if (
    file.relativePath.includes('/ieeg/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    checkheader('name', 0, file, 72)
    checkheader('type', 1, file, 72)
    checkheader('units', 2, file, 72)
    checkheader('low_cutoff', 3, file, 72)
    checkheader('high_cutoff', 4, file, 72)
    checkStatusCol(rows, file, issues)
    checkTypecol(rows, file, issues)
  }

  // electrodes.tsv
  if (
    file.relativePath.includes('/eeg/') &&
    file.name.endsWith('_electrodes.tsv')
  ) {
    checkheader('name', 0, file, 96)
    checkheader('x', 1, file, 96)
    checkheader('y', 2, file, 96)
    checkheader('z', 3, file, 96)
  }

  if (
    file.relativePath.includes('/ieeg/') &&
    file.name.endsWith('_electrodes.tsv')
  ) {
    checkheader('name', 0, file, 73)
    checkheader('x', 1, file, 73)
    checkheader('y', 2, file, 73)
    checkheader('z', 3, file, 73)
    checkheader('size', 4, file, 73)
  }

  // check for valid SI units
  /* 
   * Commenting out call to validation until it is inline with spec:
   * https://github.com/bids-standard/bids-specification/pull/411
  if (headers.includes('units')) {
    const unitIndex = headers.indexOf('units')
    rows
      // discard headers
      .slice(1)
      // extract unit values
      .map((row, i) => ({
        unit: row[unitIndex],
        line: i + 2,
      }))
      .forEach(({ unit, line }) => {
        const { isValid, evidence } = utils.unit.validate(unit)
        if (!isValid)
          issues.push(
            new Issue({
              line,
              file,
              code: 124,
              evidence,
            }),
          )
      })
  }
  */

  // check partcipants.tsv for age 89+

  if (file.name === 'participants.tsv') {
    checkAge89(rows, file, issues)
  }

  if (file.name.endsWith('_scans.tsv')) {
    // get the directory path for the scans.tsv
    const scanDirPath = path.dirname(file.relativePath)

    // get the subject and session for this scans.tsv file
    const subject = file.name.split('_').slice(0, 1)

    // get the relative subject path
    const subRelativePath = '/' + subject

    // get list of file paths for this subject and session
    const pathList = []
    for (let file of Object.values(fileList)) {
      const fPath = file.relativePath

      // XXX: needs to be improved, since this currently allows arbitrary directory nesting
      // dataset file needs to be within the subject
      // and session directory
      if (fPath.startsWith(subRelativePath)) {
        if (fPath.includes('.ds/') || fPath.includes('_meg/')) {
          // CTF or BTI data
          const fDir = path.dirname(fPath)
          pathList.push(fDir)
        } else {
          // all other data kinds
          pathList.push(fPath)
        }
      }
    }

    // check _scans.tsv for column filename
    if (!(headers.indexOf('filename') > -1)) {
      issues.push(
        new Issue({
          line: 1,
          file: file,
          evidence: headersEvidence(headers),
          code: 68,
        }),
      )
    } else {
      // check scans filenames match pathList
      const filenameColumn = headers.indexOf('filename')
      for (let l = 1; l < rows.length; l++) {
        const row = rows[l]
        const scanRelativePath = row[filenameColumn]
        const scanFullPath = scanDirPath + '/' + scanRelativePath

        // check if scan matches full dataset path list
        if (!pathList.includes(scanFullPath)) {
          issues.push(
            new Issue({
              line: l,
              file: file,
              code: 129,
              evidence: filenameEvidence(scanFullPath),
            }),
          )
        }
      }
    }

    // if _scans.tsv has the acq_time header, check datetime format
    if (headers.indexOf('acq_time') > -1) {
      checkAcqTimeFormat(rows, file, issues)
    }
  }
  callback(issues, participants, stimPaths)
}

export default TSV
