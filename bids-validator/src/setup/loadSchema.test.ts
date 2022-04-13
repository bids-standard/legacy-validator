import { assert, assertEquals } from '../deps/asserts.ts'
import { loadSchema } from './loadSchema.ts'

Deno.test('schema yaml loader', async t => {
  await t.step('reads in top level files document', async () => {
    const schemaDefs = await loadSchema()
    // Look for some stable fields in top level files
    if (
      typeof schemaDefs.top_level_files === 'object' &&
      schemaDefs.top_level_files !== null
    ) {
      const top_level = schemaDefs.top_level_files as Record<string, any>
      if (top_level.hasOwnProperty('README')) {
        assertEquals(top_level.README, {
          required: true,
          extensions: ['None', '.md', '.rst', '.txt'],
        })
      }
    } else {
      assert(false, 'failed to test schema defs')
    }
  })
  await t.step('loads all schema files', async () => {
    const schemaDefs = await loadSchema()
    if (typeof schemaDefs.objects === 'object' && typeof schemaDefs.rules === 'object') {
      
    } else {
      assert(false, 'failed to load objects/rules')
    }
  })
})
