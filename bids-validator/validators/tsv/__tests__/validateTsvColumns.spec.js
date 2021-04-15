import { assert } from 'chai'
import validateTsvColumns, {
  validatePetBloodHeaders,
} from '../validateTsvColumns'

describe('validateTsvColumns', () => {
  describe('for participants.tsv', () => {
    const file = {
      name: 'participants.tsv',
      relativePath: '/participants.tsv',
    }
    const jsonContentsDict = {
      '/participants.json': { NewColumn: 'description' },
    }

    it('allows for tabular files with columns that are described in the bids spec', async () => {
      const tsvs = [
        {
          contents: 'participant_id\n',
          file: file,
        },
      ]
      const issues = await validateTsvColumns(tsvs, {}, [])
      assert.lengthOf(issues, 0)
    })
    it('checks for tabular files with custom columns not described in a data dictionary', async () => {
      const tsvs = [
        {
          contents: 'header1\n',
          file: file,
        },
      ]
      const issues = await validateTsvColumns(tsvs, {}, [])
      assert.lengthOf(issues, 1)
      assert.equal(issues[0].code, 82)
    })
    it('allows custom columns if they are described in a data dictionary', async () => {
      const tsvs = [
        {
          contents: 'NewColumn\n',
          file: file,
        },
      ]
      const issues = await validateTsvColumns(tsvs, jsonContentsDict, [])
      assert.lengthOf(issues, 0)
    })
    it('should trim the new line carriages created by windows tabular files,', async () => {
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
      const issues = await validateTsvColumns(tsvs, {}, [])
      assert.lengthOf(issues, 0)
    })
  })

  describe('requires_tsv_non_custom_columns for validatePetBloodHeaders', () => {
    let tsv, mergedDict, schema
    beforeEach(() => {
      tsv = {
        contents: 'col_A\tcol_B\n',
        file: { name: 'test_blood.tsv' },
      }
      // associated json sidecar to tsv
      mergedDict = {
        PropA: true,
        PropB: true,
        PropC: '',
      }
      // minimal subset of bids-validator/validators/json/schemas/pet_blood.json
      schema = {
        properties: {
          PropA: {
            type: 'boolean',
            requires_tsv_non_custom_columns: ['col_A'],
          },
          PropB: {
            type: 'boolean',
            requires_tsv_non_custom_columns: ['col_A', 'col_B'],
          },
          PropC: { type: 'string' },
        },
      }
    })
    it('passes when required columns are present', () => {
      const issues = validatePetBloodHeaders(tsv, mergedDict, schema)
      assert.isEmpty(issues)
    })
    it('does not require columns when associated JSON properties are false', () => {
      tsv.contents = '\n'
      mergedDict.PropA = false
      mergedDict.PropB = false
      const issues = validatePetBloodHeaders(tsv, mergedDict, schema)
      assert.isEmpty(issues)
    })
    it('requires column when JSON property is true', () => {
      tsv.contents = 'col_A'
      const issues = validatePetBloodHeaders(tsv, mergedDict, schema)
      assert.lengthOf(issues, 1)
      assert.equal(issues[0].key, 'TSV_MISSING_REQUIRED_COLUMN')
      assert.equal(issues[0].file.name, tsv.file.name)
      assert.equal(issues[0].severity, 'error')
      assert.include(issues[0].evidence, 'missing header "col_B"')
    })
    it('produces errors for each missing column', () => {
      tsv.contents = '\n'
      const issues = validatePetBloodHeaders(tsv, mergedDict, schema)
      assert.lengthOf(issues, 2)
    })
  })
  it('should strip byte order marks from the start of TSV files', async () => {
    const tsvs = [
      {
        contents: '\uFEFFparticipant_id\t\r\n',
        file: {
          name: 'participants.tsv',
          relativePath: './participants.tsv',
        },
      },
    ]
    const issues = await validateTsvColumns(tsvs, {}, [])
    assert.lengthOf(issues, 0)
  })
  it('should generate error with empty columns', async () => {
    const tsvs = [
      {
        contents: '\t',
        file: {
          name: 'test.tsv',
          relativePath: './test.tsv',
        },
      },
      {
        contents: '\t\t',
        file: {
          name: 'test.tsv',
          relativePath: './test.tsv',
        },
      },
    ]
    const issues = await validateTsvColumns(tsvs, {}, [])
    assert.lengthOf(issues, 2)
  })
})
