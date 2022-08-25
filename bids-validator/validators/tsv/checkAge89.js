const Issue = require('../../utils').issues.Issue

export const checkAge89 = function (rows, file, issues) {
  const header = rows[0]
  const ageIdColumn = header.indexOf('age')
  for (let a = 0; a < rows.length; a++) {
    const line = rows[a]
    const line_values = line
    const age = line_values[ageIdColumn]
    if (age >= 89) {
      issues.push(
        new Issue({
          file: file,
          evidence: line.join(','),
          line: a + 1,
          reason: 'age of participant is above 89 ',
          code: 56,
        }),
      )
    }
  }
}

export default checkAge89
