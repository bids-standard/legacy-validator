import { assertEquals } from '../deps/asserts.ts'
import { FileIgnoreRulesDeno } from './ignore.ts'

Deno.test('Deno implementation of FileIgnoreRules', async (t) => {
  await t.step('handles basic .bidsignore rules', () => {
    const files = [
      '/sub-01/anat/sub-01_T1w.nii.gz',
      '/dataset_description.json',
      '/README',
      '/CHANGES',
      '/participants.tsv',
      '/.git/HEAD',
      '/sub-01/anat/non-bidsy-file.xyz',
    ]
    const rules = ['.git', '**/*.xyz']
    const ignore = new FileIgnoreRulesDeno(rules)
    const filtered = files.filter((path) => !ignore.test(path))
    assertEquals(filtered, [
      '/sub-01/anat/sub-01_T1w.nii.gz',
      '/dataset_description.json',
      '/README',
      '/CHANGES',
      '/participants.tsv',
    ])
  })
})
