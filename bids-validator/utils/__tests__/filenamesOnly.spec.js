import { validateFilenames } from '../filenamesOnly.js'

describe('test filenames mode', () => {
  beforeEach(() => {
    console.log = jest.fn()
  })
  it('throws an error when obviously non-BIDS input', async () => {
    async function* badData() {
      yield 'nope'
      yield 'not-bids'
      yield 'data'
    }
    const res = await validateFilenames(badData())
    expect(res).toBe(false)
  })
  it('passes validation with a simple dataset', async () => {
    async function* goodData() {
      yield 'CHANGES'
      yield 'dataset_description.json'
      yield 'participants.tsv'
      yield 'README'
      yield 'sub-01/anat/sub-01_T1w.nii.gz'
      yield 'T1w.json'
    }
    const res = await validateFilenames(goodData())
    expect(res).toBe(true)
  })
})
