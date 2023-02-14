import { assert } from 'chai'
import checkMotionComponent from '../checkMotionComponent'

describe('checkMotionComponent', () => {
  const summary = { subjects: ['01', '02'] }

  it('returns no issue if components is in correct locaiton and values are valid', () => {
    const issues = []
    checkMotionComponent(
      [
        ['test', 'component'],
        [0, 'x'],
      ],
      'testfile.tsv',
      issues,
    )
    assert.lengthOf(issues, 0)
  })
  it('returns issue if components are in wrong column', () => {
    const issues = []
    checkMotionComponent(
      [
        ['component', 'test'],
        ['x', 0],
      ],
      'testfile.tsv',
      issues,
    )
    assert.lengthOf(issues, 1)
    assert(issues[0].code === 235)
  })
  it('returns issue if components are incorrect value', () => {
    const issues = []
    checkMotionComponent(
      [
        ['test', 'component'],
        [0, 0],
      ],
      'testfile.tsv',
      issues,
    )
    assert.lengthOf(issues, 1)
    assert(issues[0].code === 236)
  })
})