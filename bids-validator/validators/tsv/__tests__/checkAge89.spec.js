import { checkAge89 } from '../checkAge89'

describe('checkAge89()', () => {
  it('returns evidence in the expected string format', () => {
    // Evidence should always be a human-readable string
    const issues = []
    const exampleParticipants = [['age'], [90]]
    const mockFile = {}
    checkAge89(exampleParticipants, mockFile, issues)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toHaveProperty('evidence')
    expect(typeof issues[0].evidence).toBe('string')
  })
})
