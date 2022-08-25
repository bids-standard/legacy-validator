// Deno runtime tests for tests/data/empty_files
import { assert, assertEquals, assertObjectMatch } from '../../deps/asserts.ts'
import { validatePath, formatAssertIssue } from './common.ts'

const PATH = 'tests/data/empty_files'

/**
 * Contains stripped down CTF format dataset: Both, BadChannels and
 * bad.segments files can be empty and still valid. Everything else must
 * not be empty.
 */
Deno.test('empty_files dataset', async (t) => {
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

  // *.meg4 and BadChannels files are empty. But only *.meg4 is an issue
  await t.step(
    'EMPTY_FILES error is thrown for only sub-0001_task-AEF_run-01_meg.meg4',
    () => {
      const issue = result.issues.get('EMPTY_FILE')
      assert(issue, 'EMPTY_FILES was not thrown as expected')
      assertObjectMatch(issue, {
        key: 'EMPTY_FILE',
        severity: 'error',
      })
      assert(
        issue.files.get(
          '/sub-0001/meg/sub-0001_task-AEF_run-01_meg.ds/sub-0001_task-AEF_run-01_meg.meg4',
        ),
        'sub-0001_task-AEF_run-01_meg.meg4 is empty but not present in EMPTY_FILE issue',
      )
      assertEquals(
        issue.files.get(
          'tests/data/empty_files/sub-0001/meg/sub-0001_task-AEF_run-01_meg.ds/BadChannels',
        ),
        undefined,
        'BadChannels should not be included in EMPTY_FILES error',
      )
    },
  )
})
