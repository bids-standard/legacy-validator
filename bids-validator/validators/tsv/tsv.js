import Issue from '../../utils/issues/issue'
import checkAcqTimeFormat from './checkAcqTimeFormat'
import checkAge89 from './checkAge89'
import checkHeaders from './checkHeaders'
import checkStatusCol from './checkStatusCol'
import checkTypecol from './checkTypeCol'
import parseTSV from './tsvParser'
import checkMotionComponent from './checkMotionComponent'
import getSessionStorage from '../../utils/getSessionStorage'
import ignore from 'ignore'
var path = require('path')

const sessionStorage = getSessionStorage()

/**
 * Format TSV headers for evidence string
 * @param {Array[string]} headers
 * @returns {string}
 */
export const headersEvidence = (headers) =>
  `Column headers: ${headers.join(', ')}`

/**
 * Format TSV filename for evidence string
 * @param {Array[string]} filename
 * @returns {string}
 */
const filenameEvidence = (filename) => `Filename: ${filename}`

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

  // motion tsvs don't have headers
  if (!file.name.endsWith('_motion.tsv')) {
    checkHeaders(headers, file, issues)
  }

  for (let i = 1; i < rows.length; i++) {
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
  const checkheader = function checkheader(
    headername,
    idx,
    file,
    missingCode,
    orderCode = null,
  ) {
    let code = missingCode
    if (headers.includes(headername) && orderCode) {
      code = orderCode
    }

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
      if (fileList.hasOwnProperty(f)) {
        pathList.push(fileList[f].relativePath)
      }
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

    // if the participant_id column is missing, an error
    // will be raised
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
      // otherwise, the participants should comprise of
      // sub-<subject_id> and one subject per row
      participants = []
      for (let l = 1; l < rows.length; l++) {
        const row = rows[l]
        // skip empty rows
        if (!row || /^\s*$/.test(row)) {
          continue
        }

        // check if any incorrect patterns in participant_id column
        if (!row[participantIdColumn].startsWith('sub-')) {
          issues.push(
            new Issue({
              file: file,
              evidence: headersEvidence(headers),
              reason:
                'Participant_id column should be named ' +
                'as sub-<subject_id>.',
              line: l,
              code: 212,
            }),
          )
        }

        // obtain a list of the subject IDs in the participants.tsv file
        const participant = row[participantIdColumn].replace('sub-', '')
        if (participant == 'emptyroom') {
          continue
        }
        participants.push(participant)
      }
    }
  }

  // samples.tsv
  let samples = null
  if (file.name === 'samples.tsv') {
    const sampleIssues = []
    const sampleIdColumnValues = []
    const participantIdColumnValues = []
    const sampleIdColumn = headers.indexOf('sample_id')
    const participantIdColumn = headers.indexOf('participant_id')
    const sampleTypeColumn = headers.indexOf('sample_type')

    // if the sample_id column is missing, an error
    // will be raised
    if (sampleIdColumn === -1) {
      sampleIssues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          code: 216,
        }),
      )
    }
    // if the participant_id column is missing, an error
    // will be raised
    if (participantIdColumn === -1) {
      sampleIssues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          code: 217,
        }),
      )
    }
    // if the sample_type column is missing, an error
    // will be raised
    if (sampleTypeColumn === -1) {
      sampleIssues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          code: 218,
        }),
      )
    }
    // Fold sampleIssues into main issue array, only needed it for this
    // conditional.
    issues.push(...sampleIssues)
    if (sampleIssues.length === 0) {
      // otherwise, the samples should comprise of
      // sample-<sample_id> and one sample per row
      samples = []
      for (let l = 1; l < rows.length; l++) {
        const row = rows[l]
        // skip empty rows
        if (!row || /^\s*$/.test(row)) {
          continue
        }
        sampleIdColumnValues.push(row[sampleIdColumn])

        // check if any incorrect patterns in sample_id column
        if (!row[sampleIdColumn].startsWith('sample-')) {
          issues.push(
            new Issue({
              file: file,
              evidence: row[sampleIdColumn],
              reason:
                'sample_id column should be named ' + 'as sample-<sample_id>.',
              line: l,
              code: 215,
            }),
          )
        }
      }
      // The participants should comprise of
      // sub-<subject_id> and one subject per row
      participants = []
      for (let l = 1; l < rows.length; l++) {
        const row = rows[l]
        // skip empty rows
        if (!row || /^\s*$/.test(row)) {
          continue
        }
        participantIdColumnValues.push(row[participantIdColumn])

        // check if any incorrect patterns in participant_id column
        if (!row[participantIdColumn].startsWith('sub-')) {
          issues.push(
            new Issue({
              file: file,
              evidence: row[participantIdColumn],
              reason:
                'Participant_id column should be named ' +
                'as sub-<subject_id>.',
              line: l,
              code: 212,
            }),
          )
        }

        // obtain a list of the sample IDs in the samples.tsv file
        const sample = row[sampleIdColumn].replace('sample-', '')
        if (sample == 'emptyroom') {
          continue
        }
        samples.push(sample)
      }

      // check if a sample from same subject is described by one and only one row
      let samplePartIdsSet = new Set()
      for (let r = 0; r < rows.length - 1; r++) {
        let uniqueString = sampleIdColumnValues[r].concat(
          participantIdColumnValues[r],
        )
        // check if SampleId Have Duplicate
        if (samplePartIdsSet.has(uniqueString)) {
          issues.push(
            new Issue({
              file: file,
              evidence: sampleIdColumnValues,
              reason:
                'Each sample from a same subject MUST be described by one and only one row.',
              line: 1,
              code: 220,
            }),
          )
          break
        } else samplePartIdsSet.add(uniqueString)
      }
    }

    if (sampleTypeColumn !== -1) {
      // check if any incorrect patterns in sample_type column
      const validSampleTypes = [
        'cell line',
        'in vitro differentiated cells',
        'primary cell',
        'cell-free sample',
        'cloning host',
        'tissue',
        'whole organisms',
        'organoid',
        'technical sample',
      ]
      for (let c = 1; c < rows.length; c++) {
        const row = rows[c]
        if (!validSampleTypes.includes(row[sampleTypeColumn])) {
          issues.push(
            new Issue({
              file: file,
              evidence: row[sampleTypeColumn],
              reason: "sample_type can't be any value.",
              line: c + 1,
              code: 219,
            }),
          )
        }
      }
    }
  }

  if (
    file.relativePath.includes('/meg/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    checkheader('name', 0, file, 71, 230)
    checkheader('type', 1, file, 71, 230)
    checkheader('units', 2, file, 71, 230)
    checkStatusCol(rows, file, issues)
    checkTypecol(rows, file, issues)
  }

  if (
    file.relativePath.includes('/eeg/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    checkheader('name', 0, file, 71, 230)
    checkheader('type', 1, file, 71, 230)
    checkheader('units', 2, file, 71, 230)
    checkStatusCol(rows, file, issues)
    checkTypecol(rows, file, issues)
  }

  if (
    file.relativePath.includes('/ieeg/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    checkheader('name', 0, file, 72, 229)
    checkheader('type', 1, file, 72, 229)
    checkheader('units', 2, file, 72, 229)
    checkheader('low_cutoff', 3, file, 72, 229)
    checkheader('high_cutoff', 4, file, 72, 229)
    checkStatusCol(rows, file, issues)
    checkTypecol(rows, file, issues)
  }

  if (
    file.relativePath.includes('/motion/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    const required = ['component', 'name', 'tracked_point', 'type', 'units']
    const missing = required.filter((x) => !headers.includes(x))
    if (missing.length) {
      issues.push(
        new Issue({
          line: 1,
          file: file,
          code: 129,
          evidence: `Missing Columns: ${missing.join(', ')}`,
        }),
      )
    }
    checkStatusCol(rows, file, issues)
    checkTypecol(rows, file, issues)
    checkMotionComponent(rows, file, issues)
  }
  if (
    file.relativePath.includes('/nirs/') &&
    file.name.endsWith('_channels.tsv')
  ) {
    checkheader('name', 0, file, 234)
    checkheader('type', 1, file, 234)
    checkheader('source', 2, file, 234)
    checkheader('detector', 3, file, 234)
    checkheader('wavelength_nominal', 4, file, 234)
    checkheader('units', 5, file, 234)
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

  if (
    file.relativePath.includes('/nirs/') &&
    file.name.endsWith('_optodes.tsv')
  ) {
    checkheader('name', 0, file, 233)
    checkheader('type', 1, file, 233)
    checkheader('x', 2, file, 233)
    checkheader('y', 3, file, 233)
    checkheader('z', 4, file, 233)
  }

  // blood.tsv
  if (file.relativePath.includes('/pet/') && file.name.endsWith('_blood.tsv')) {
    // Validate fields here
    checkheader('time', 0, file, 126)
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

  // check participants.tsv for age 89+
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
        } else if (fPath.includes('_ieeg.mefd/')) {
          // MEF3 data
          const fDir = fPath.substring(0, fPath.indexOf('_ieeg.mefd/') + 10)
          if (!pathList.includes(fDir)) {
            pathList.push(fDir)
          }
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
      // Retrieve the .bidsignore content (if any) from session storage
      const content = sessionStorage.getItem('bidsignoreContent')
      const ig = content ? ignore().add(JSON.parse(content)) : null

      // check scans filenames match pathList
      const filenameColumn = headers.indexOf('filename')
      for (let l = 1; l < rows.length; l++) {
        const row = rows[l]
        const scanRelativePath = row[filenameColumn]
        const scanFullPath = scanDirPath + '/' + scanRelativePath

        // check if file should be ignored based on .bidsignore content
        if (ig && ig.ignores(path.relative('/', scanRelativePath))) {
          continue
        }

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
