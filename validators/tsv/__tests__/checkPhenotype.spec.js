const assert = require('chai').assert
const checkPhenotype = require('../checkPhenotype')

describe('checkPhenotype', () => {
  const summary = { subjects: ['01', '02'] }

  it('returns no issue if there are no phenotype participants provided', () => {
    const issues = checkPhenotype([], [])
    assert.lengthOf(issues, 0)
  })
  it('returns no issues if all phenotype participants are included in the summary object', () => {
    const phenotypeParticipants = [{ list: ['01', '02'] }]
    const issues = checkPhenotype(phenotypeParticipants, summary)
    assert.lengthOf(issues, 0)
  })
  it('returns issue code 51 if phenotype participants are not the same as subjects', () => {
    const phenotypeParticipants = [
      { file: 'phenotype/test.tsv', list: ['01', '06'] },
    ]
    const issues = checkPhenotype(phenotypeParticipants, summary)
    assert.lengthOf(issues, 1)
  })
  it('returns issues for any mismatched participants.tsv files', () => {
    const phenotypeParticipants = [
      { file: 'phenotype/test_1.tsv', list: ['01', '06'] },
      { file: 'phenotype/test_2.tsv', list: ['01', '07'] },
    ]
    const issues = checkPhenotype(phenotypeParticipants, summary)
    assert.lengthOf(issues, 2)
  })
})
