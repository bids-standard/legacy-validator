import { FileTree } from '../types/filetree.ts'
import { GenericSchema } from '../types/schema.ts'
import { assertEquals } from '../deps/asserts.ts'
import { BIDSContext } from '../schema/context.ts'
import { missingLabel, atRoot, entityLabelCheck } from './filenameValidate.ts'
import { BIDSFileDeno } from '../files/deno.ts'
import { DatasetIssues } from '../issues/datasetIssues.ts'
import { FileIgnoreRules } from '../files/ignore.ts'
import { loadSchema } from '../setup/loadSchema.ts'

const schema = (await loadSchema()) as unknown as GenericSchema
const fileTree = new FileTree('/tmp', '/')
const issues = new DatasetIssues()
const ignore = new FileIgnoreRules([])

const splitFile = (path: string) => {
  const parts = path.split('/')
  return {
    dirname: parts.slice(0, parts.length - 1).join('/'),
    basename: parts[parts.length - 1],
  }
}

Deno.test('test missingLabel', async (t) => {
  await t.step('File with underscore and no hyphens errors out.', async () => {
    const tmpFile = Deno.makeTempFileSync({
      prefix: 'no_labels_',
      suffix: '_entities.wav',
    })
    const { dirname, basename } = splitFile(tmpFile)
    const file = new BIDSFileDeno(dirname, basename, ignore)

    const context = new BIDSContext(fileTree, file, issues)
    await missingLabel(schema, context)
    assertEquals(
      context.issues
        .getFileIssueKeys(context.file.path)
        .includes('ENTITY_WITH_NO_LABEL'),
      true,
    )
    Deno.removeSync(tmpFile)
  })

  await t.step(
    "File with underscores and hyphens doesn't error out.",
    async () => {
      const tmpFile = Deno.makeTempFileSync({
        prefix: 'we-do_have-',
        suffix: '_entities.wav',
      })
      const { dirname, basename } = splitFile(tmpFile)
      const file = new BIDSFileDeno(dirname, basename, ignore)
      const context = new BIDSContext(fileTree, file, issues)
      await missingLabel(schema, context)
      assertEquals(
        context.issues
          .getFileIssueKeys(context.file.path)
          .includes('ENTITY_WITH_NO_LABEL'),
        false,
      )
      Deno.removeSync(tmpFile)
    },
  )
})
