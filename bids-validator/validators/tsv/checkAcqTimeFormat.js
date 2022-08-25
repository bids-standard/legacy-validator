const Issue = require('../../utils').issues.Issue
import { isValid as dateIsValid, parseISO } from 'date-fns'

const checkAcqTimeFormat = function (rows, file, issues) {
  const rfc3339ish = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z?$/
  const header = rows[0]
  const acqTimeColumn = header.indexOf('acq_time')
  const testRows = rows.slice(1)
  testRows.map((line, i) => {
    const lineValues = line
    const acqTime = lineValues[acqTimeColumn]
    let isValid = dateIsValid(parseISO(acqTime)) && rfc3339ish.test(acqTime)

    if (acqTime === 'n/a') {
      isValid = true
    }

    if (acqTime && !isValid) {
      issues.push(
        new Issue({
          file: file,
          evidence: acqTime,
          line: i + 2,
          reason: 'acq_time is not in the format yyyy-MM-ddTHH:mm:ss[.000000]',
          code: 84,
        }),
      )
    }
  })
}

export default checkAcqTimeFormat
