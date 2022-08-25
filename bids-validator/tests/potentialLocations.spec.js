import assert from 'assert'
import potentialLocations from '../utils/files/potentialLocations'

describe('potentialLocations', () => {
  it('should not return duplicate paths', () => {
    const path = 'data/BIDS-examples/ds001'
    const pLs = potentialLocations(path)
    assert.deepEqual(pLs.length, new Set(pLs).size)
  })
  it('.bold files should only return potential locations that include tasknames', () => {
    const path = 'dsTest/sub-01/func/sub-01_task-testing_run-01_bold.json'
    const pLs = potentialLocations(path)
    const anyNonTaskSpecific = pLs.some(
      (location) => location.indexOf('task') < 0,
    )
    assert.equal(anyNonTaskSpecific, false)
  })
})
