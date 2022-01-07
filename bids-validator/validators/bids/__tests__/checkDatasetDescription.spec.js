import { assert } from 'chai'
import checkDatasetDescription from '../checkDatasetDescription'

describe('checkDatasetDescription', () => {
  describe('checkAuthorField', () => {
    it('returns no issues with valid Authors field', () => {
      const validJsonContentsDict = {
        '/dataset_description.json': {
          Authors: ['Benny', 'the Jets'],
        },
      }
      const issues = checkDatasetDescription(validJsonContentsDict)
      assert.lengthOf(issues, 0)
    })
    it('returns code 102 when there is only one author present', () => {
      const invalidJsonContentsDict = {
        '/dataset_description.json': {
          Authors: ['Benny'],
        },
      }
      const issues = checkDatasetDescription(invalidJsonContentsDict)
      assert(
        issues.findIndex(issue => issue.code === 102) > -1,
        'issues include a code 102',
      )
    })
    it('returns code 103 when there an author has more than one comma', () => {
      const invalidJsonContentsDict = {
        '/dataset_description.json': {
          Authors: ['Benny, and the, Jets'],
        },
      }
      const issues = checkDatasetDescription(invalidJsonContentsDict)
      assert(
        issues.findIndex(issue => issue.code === 103) > -1,
        'issues include a code 103',
      )
    })
    it('returns code 113 when there are no Authors', () => {
      const invalidJsonContentsDict = {
        '/dataset_description.json': {
          Authors: [],
        },
      }
      let issues = checkDatasetDescription(invalidJsonContentsDict)
      assert(
        issues.findIndex(issue => issue.code === 113) > -1,
        'issues include a code 113',
      )

      const invalidJsonContentsDict2 = {
        '/dataset_description.json': {},
      }
      issues = checkDatasetDescription(invalidJsonContentsDict2)
      assert(
        issues.findIndex(issue => issue.code === 113) > -1,
        'issues include a code 113',
      )
    })
  })
  describe('checkGeneticDatabaseField', () => {
    it('returns code 128 when there is no Genetics.Dataset with a genetic_info.json present', () => {
      const invalidJsonContentsDict = {
        '/dataset_description.json': {},
        '/genetic_info.json': {},
      }
      let issues = checkDatasetDescription(invalidJsonContentsDict)
      assert(
        issues.findIndex(issue => issue.code === 128) > -1,
        'issues include a code 128',
      )
    })
    it('does not return code 128 when GeneticDataset field and genetic_info.json present', () => {
      const validJsonContentsDict = {
        '/dataset_description.json': {
          Authors: ['Benny', 'the Jets'],
          Genetics: { Dataset: 'GeneticGeneticDataset' },
        },
        '/genetic_info.json': {},
      }
      let issues = checkDatasetDescription(validJsonContentsDict)
      assert(
        issues.findIndex(issue => issue.code === 128) === -1,
        'issues does not include a code 128',
      )
    })
  })
})
