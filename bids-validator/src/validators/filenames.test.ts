// @ts-nocheck
import { SEP } from '../deps/path.ts'
import { assertEquals } from '../deps/asserts.ts'
import {
  checkDatatypes,
  checkLabelFormat,
  datatypeFromDirectory,
} from './filenames.ts'
import { loadSchema } from '../setup/loadSchema.ts'
import { readEntities } from '../schema/entities.ts'
import { DatasetIssues } from '../issues/datasetIssues.ts'

const schema = await loadSchema()

const newContext = (path: string) => {
  const parts = path.split(SEP)
  const name = parts[parts.length - 1]
  return {
    issues: new DatasetIssues(),
    file: {
      path: path,
      name: name,
    },
    modality: '',
    datatype: '',
    suffix: '',
    entities: [],
    extension: '',
  }
}

Deno.test('test datatypeFromDirectory', (t) => {
  const filesToTest = [
    ['/sub-01/func/bad_filename.txt', 'func'],
    ['/sub-02/ses-01/anat/bad_filename.txt', 'anat'],
    ['/sub-02/ses-01/bad/bad_filename.txt', ''],
  ]
  filesToTest.map((test) => {
    const context = newContext(test[0])
    datatypeFromDirectory(schema, context)
    assertEquals(context.datatype, test[1])
  })
})

Deno.test('test checkDatatype', async (t) => {
  await t.step('Check no errors on good file', () => {
    const filesToTest = [['/sub-01/func/sub-01_task-taskname_bold.json', []]]
    filesToTest.map((test) => {
      let context = newContext(test[0])
      context = { ...context, ...readEntities(context.file) }
      checkDatatypes(schema, context)
      assertEquals(context.issues.fileInIssues(test[0]), test[1])
    })
  })

  await t.step('Check for correct issues generated', () => {
    const filesToTest = [
      ['/sub-01/anat/sub-01_task-taskname_bold.json', 'DATATYPE_MISMATCH'],
      ['/sub-01/func/task-taskname_bold.json', 'MISSING_REQUIRED_ENTITY'],
      [
        '/sub-01/func/sub-01_task-taskname_bad-ent_bold.json',
        'ENTITY_NOT_IN_RULE',
      ],
    ]
    filesToTest.map((test) => {
      let context = newContext(test[0])
      context = { ...context, ...readEntities(context.file) }
      checkDatatypes(schema, context)
      assertEquals(
        context.issues.getFileIssueKeys(test[0]).includes(test[1]),
        true,
      )
    })
  })
})

Deno.test('test checkLabelFormat', (t) => {
  const code = 'INVALID_ENTITY_LABEL'
  const filesToTest = [
    ['/sub-01/func/sub-01_task-taskname_bold.json', false],
    ['/sub-01/func/sub-01_task-+1_bold.json', true],
  ]
  filesToTest.map((test) => {
    let context = newContext(test[0])
    context = { ...context, ...readEntities(context.file) }
    checkLabelFormat(schema, context)
    assertEquals(
      context.issues.getFileIssueKeys(test[0]).includes(code),
      test[1],
    )
  })
})
