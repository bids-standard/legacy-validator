const assert = require('chai').assert
const subjects = require('../subjects')

describe('subjects', () => {
  const subjectsArray = ['01', '02', '03']

  describe('participantsInSubjects', () => {
    it('returns no issues if there are no participants provided', () => {
      const issues = subjects.participantsInSubjects(null, [])
      assert.lengthOf(issues, 0)
    })
    it('returns no issues if all participants are in the subjects array', () => {
      const participants = {
        list: subjectsArray,
      }
      const issues = subjects.participantsInSubjects(
        participants,
        subjectsArray,
      )
      assert.lengthOf(issues, 0)
    })
    it('return issue code 49 if participants are not the same as subjects', () => {
      const participants = {
        list: ['01', '05'],
      }
      const issues = subjects.participantsInSubjects(
        participants,
        subjectsArray,
      )
      assert.lengthOf(issues, 1)
      assert.equal(issues[0].code, 49)
    })
  })
})
