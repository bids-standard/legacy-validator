import { assertEquals } from '../deps/asserts.ts'
import { parseOptions } from './options.ts'

Deno.test('options parsing', async (t) => {
  await t.step('config.ignore', () => {
    const options = parseOptions([
      '--config.ignore=99',
      '--config.ignore=44',
      'path/to/bids/dir',
    ])
    assertEquals(options._, ['path/to/bids/dir'])
    assertEquals(options.config.ignore, [99, 44])
  })

  await t.step('schema option', () => {
    const options = parseOptions(['--schema', 'v1.6.0', 'path/to/bids/dir'])
    assertEquals(options._, ['path/to/bids/dir'])
    assertEquals(options.config.ignore, undefined)
    assertEquals(options.schema, 'v1.6.0')
  })
})
