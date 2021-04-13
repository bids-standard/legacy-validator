import Issue from '../../utils/issues/issue.js'

// allowable 'type' values from the BIDS specification
const allowedMEEGTypes = [
  'EEG',
  'ECOG',
  'SEEG',
  'DBS',
  'PD',
  'OTHER', // (i)EEG
  'EOG',
  'ECG',
  'EMG',
  'EYEGAZE',
  'GSR',
  'HEOG',
  'MISC',
  'PUPIL',
  'RESP',
  'TEMP',
  'VEOG',
  'PPG', // physio
  'AUDIO',
  'REF',
  'SYSCLOCK',
  'TRIG',
  'ADC',
  'DAC', // system
  'MEGMAG',
  'MEGGRADAXIAL',
  'MEGGRADPLANAR',
  'MEGREFMAG',
  'MEGREFGRADAXIAL',
  'MEGREFGRADPLANAR',
  'MEGOTHER',
  'HLU',
  'FITERR', // MEG
]

/**
 * Checks type column in an ephys _channels.tsv file to
 * ensure its values are only in an acceptable set of values and fires off a
 * warning to the user if the characters are not all upper-case.
 * @param {string[]} rows - Each row of a tsv file to be checked.
 * @param {Object} file - File of rows being checked, used for error message if
 *     problem is found.
 * @param {Object[]} issues - Array of issue objects to add to if problem is
 *     found.
 * @returns {null} Results of this function are stored in issues.
 */
const checkTypeCol = function(rows, file, issues) {
  const header = rows[0]
  const typeColumn = header.indexOf('type')
  if (typeColumn !== -1) {
    for (let i = 1; i < rows.length; i++) {
      const line = rows[i]
      let type = line[typeColumn]

      if (type === 'n/a') {
        continue
      }
      // check type casing
      let isUpperCase = true
      if (type != type.toUpperCase()) {
        // The character is lowercase
        isUpperCase = false
      }
      // only deal with upper casing when validating for errors
      type = type.toUpperCase()

      // check if an error, or a warning is needed
      if (!allowedMEEGTypes.includes(type)) {
        issues.push(
          new Issue({
            file: file,
            evidence: line,
            line: i + 1,
            reason:
              'the type column values should only consist of values specified for *_channels.tsv file',
            code: 131,
          }),
        )
      } else if (!isUpperCase) {
        // not upper case, then warn user to use upper-casing
        issues.push(
          new Issue({
            file: file,
            evidence: line,
            line: i + 1,
            reason: 'the type column values upper-cased',
            code: 130,
          }),
        )
      }
    }
  }
  return
}

export default checkTypeCol
