import { assertEquals, assertObjectMatch } from '../deps/asserts.ts'
import { BIDSFile } from '../types/file.ts'
import { IssueFile } from '../types/issues.ts'
import { DatasetIssues } from './datasetIssues.ts'

Deno.test('DatasetIssues management class', async (t) => {
  await t.step('Constructor succeeds', () => {
    new DatasetIssues()
  })
  await t.step('add an Issue', () => {
    const issues = new DatasetIssues()
    issues.add({ key: 'TEST_ERROR', reason: 'Test issue' })
    assertEquals(issues.hasIssue({ key: 'TEST_ERROR' }), true)
  })
  await t.step('add Issue with several kinds of files', () => {
    // This mostly tests the issueFile mapping function
    const issues = new DatasetIssues()
    const testStream = new ReadableStream()
    const text = () => Promise.resolve('')
    const files = [
      {
        text,
        name: 'dataset_description.json',
        path: '/dataset_description.json',
        size: 500,
        ignored: false,
        stream: testStream,
      } as BIDSFile,
      {
        text,
        name: 'README',
        path: '/README',
        size: 500,
        ignored: false,
        stream: testStream,
        line: 1,
        character: 5,
        severity: 'warning',
        reason: 'Readme borked',
      } as IssueFile,
    ]
    issues.add({ key: 'TEST_FILES_ERROR', reason: 'Test issue', files })
    assertEquals(issues.getFileIssueKeys('/README'), ['TEST_FILES_ERROR'])
    for (const [key, issue] of issues) {
      assertObjectMatch(issue, { key: 'TEST_FILES_ERROR' })
      for (const f of issue.files.values()) {
        // Checking all files for the key assures they are in IssueFile format
        assertObjectMatch(f, {
          stream: Promise.resolve(testStream),
        })
      }
    }
  })
  await t.step(
    'issues formatted matching the expected IssueOutput type',
    () => {
      const issues = new DatasetIssues()
      issues.add({ key: 'TEST_ERROR', reason: 'Test issue' })
      assertEquals(issues.hasIssue({ key: 'TEST_ERROR' }), true)
      assertEquals(issues.formatOutput(), {
        errors: [
          {
            additionalFileCount: 0,
            code: -9007199254740991,
            files: [],
            helpUrl: 'https://neurostars.org/search?q=TEST_ERROR',
            key: 'TEST_ERROR',
            reason: 'Test issue',
            severity: 'error',
          },
        ],
        warnings: [],
      })
    },
  )
})
