import { assert } from 'chai'
import validateTsvColumns from '../validateTsvColumns'

describe('validateTsvColumns', () => {
  const file = {
    name: 'participants.tsv',
    relativePath: '/participants.tsv',
  }
  const jsonContentsDict = {
    '/participants.json': { NewColumn: 'description' },
  }

  it('allows for tabular files with columns that are described in the bids spec', () => {
    const tsvs = [
      {
        contents: 'participant_id\n',
        file: file,
      },
    ]
    const issues = validateTsvColumns(tsvs, {}, [])
    assert.lengthOf(issues, 0)
  })
  it('checks for tabular files with custom columns not described in a data dictionary', () => {
    const tsvs = [
      {
        contents: 'header1\n',
        file: file,
      },
    ]
    const issues = validateTsvColumns(tsvs, {}, [])
    assert.lengthOf(issues, 1)
    assert.equal(issues[0].code, 82)
  })
  it('allows custom columns if they are described in a data dictionary', () => {
    const tsvs = [
      {
        contents: 'NewColumn\n',
        file: file,
      },
    ]
    const issues = validateTsvColumns(tsvs, jsonContentsDict, [])
    assert.lengthOf(issues, 0)
  })
  it('should trim the new line carriages created by windows tabular files,', () => {
    const tsvs = [
      {
        contents: 'participant_id\t\r\n',
        file: file,
      },
      {
        contents: 'participant_id\r\n',
        file: file,
      },
    ]
    const issues = validateTsvColumns(tsvs, {}, [])
    assert.lengthOf(issues, 0)
  })
})
