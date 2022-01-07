import { validateFilenames } from '../filenamesOnly.js'

describe('test filenames mode', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    console.log = jest.fn()
  })
  it('throws an error when obviously non-BIDS input', async () => {
    async function* badData() {
      yield '0001'
      yield 'nope'
      yield 'not-bids'
      yield 'data'
    }
    const res = await validateFilenames(badData())
    expect(res).toBe(false)
  })
  it('passes validation with a simple dataset', async () => {
    async function* goodData() {
      yield '0001'
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
  it('passes validation with .bidsignore', async () => {
    async function* goodData() {
      yield 'sub-02/*'
      yield '0001'
      yield 'CHANGES'
      yield 'dataset_description.json'
      yield 'participants.tsv'
      yield 'README'
      yield 'sub-01/anat/sub-01_T1w.nii.gz'
      yield 'T1w.json'
      yield 'sub-02/not-bids-file.txt'
    }
    const res = await validateFilenames(goodData())
    expect(res).toBe(true)
  })
})
