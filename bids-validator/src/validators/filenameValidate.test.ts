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
const ignore = new FileIgnoreRules([])

Deno.test('test missingLabel', async (t) => {
  const tmpDir = Deno.makeTempDirSync()
  const fileTree = new FileTree(tmpDir, '/')
  await t.step('File with underscore and no hyphens errors out.', async () => {
    const basename = 'no_label_entities.wav'
    Deno.writeTextFileSync(`${tmpDir}/${basename}`, '')

    const context = new BIDSContext(
      fileTree,
      new BIDSFileDeno(tmpDir, `/${basename}`, ignore),
      new DatasetIssues(),
    )

    await missingLabel(schema, context)
    assertEquals(
      context.issues
        .getFileIssueKeys(context.file.path)
        .includes('ENTITY_WITH_NO_LABEL'),
      true,
    )
  })

  await t.step(
    "File with underscores and hyphens doesn't error out.",
    async () => {
      const basename = 'we-do_have-some_entities.wav'
      Deno.writeTextFileSync(`${tmpDir}/${basename}`, '')

      const context = new BIDSContext(
        fileTree,
        new BIDSFileDeno(tmpDir, `/${basename}`, ignore),
        new DatasetIssues(),
      )

      await missingLabel(schema, context)
      assertEquals(
        context.issues
          .getFileIssueKeys(context.file.path)
          .includes('ENTITY_WITH_NO_LABEL'),
        false,
      )
    },
  )
  Deno.removeSync(tmpDir, { recursive: true })
})
