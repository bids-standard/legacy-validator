// Deno runtime tests for tests/data/valid_dataset
import { assert, assertEquals } from '../../deps/asserts.ts'
import { validatePath, formatAssertIssue } from './common.ts'

const PATH = 'tests/data/valid_dataset'

Deno.test('valid_dataset dataset', async t => {
  const { tree, result } = await validatePath(t, PATH)

  await t.step('correctly ignores .bidsignore files', () => {
    assert(
      result.issues.get('NOT_INCLUDED') === undefined,
      formatAssertIssue(
        'NOT_INCLUDED should not be present',
        result.issues.get('NOT_INCLUDED'),
      ),
    )
  })
})
