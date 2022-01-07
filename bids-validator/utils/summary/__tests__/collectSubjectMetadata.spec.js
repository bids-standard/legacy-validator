import collectSubjectMetadata from '../collectSubjectMetadata.js'

const CRLFParticipantsTsv = 'participant_id\tsex\tage\r\nsub-01\tM\t25\r\n'

describe('collectSubjectMetadata()', () => {
  it('handles Windows newline characters in column row', () => {
    expect(collectSubjectMetadata(CRLFParticipantsTsv)).toEqual([
      {
        age: 25,
        participantId: '01',
        sex: 'M',
      },
    ])
  })
})
