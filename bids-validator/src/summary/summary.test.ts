import { computeModalities, modalityPrettyLookup, Summary } from './summary.ts'
import { assertEquals, assertObjectMatch } from '../deps/asserts.ts'

Deno.test('Summary class and helper functions', async (t) => {
  await t.step('Constructor succeeds', () => {
    new Summary()
  })
  await t.step('computeModalities properly sorts modality counts', () => {
    const modalitiesIn = { eeg: 5, pet: 6, mri: 6, ieeg: 6 }
    const modalitiesOut = ['pet', 'ieeg', 'mri', 'eeg'].map(
      (x) => modalityPrettyLookup[x],
    )
    assertEquals(computeModalities(modalitiesIn), modalitiesOut)
  })
})
