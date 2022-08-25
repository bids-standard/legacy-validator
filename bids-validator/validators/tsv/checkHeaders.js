import Issue from '../../utils/issues/issue'
import { headersEvidence } from './tsv'

const checkHeaders = (headers, file, issues) => {
  headers.map((header, i) => {
    if (i !== headers.findIndex((x) => x === header)) {
      issues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          reason: 'Duplicate value at column #' + (i + 1),
          code: 231,
        }),
      )
    }
    if (/^\s*$/.test(header)) {
      issues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          reason: 'Missing value at column # ' + (i + 1),
          code: 23,
        }),
      )
    }
    if (header === 'n/a') {
      issues.push(
        new Issue({
          file: file,
          evidence: headersEvidence(headers),
          line: 1,
          reason: 'n/a value in header at column #' + (i + 1),
          code: 232,
        }),
      )
    }
  })
}

export default checkHeaders
