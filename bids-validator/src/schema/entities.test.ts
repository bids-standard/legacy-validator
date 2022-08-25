import { assert, assertEquals } from '../deps/asserts.ts'
import { BIDSFile } from '../types/file.ts'
import { readEntities } from './entities.ts'

Deno.test('test readEntities', async (t) => {
  const testFile = {
    name: 'task-rhymejudgment_bold.json',
    path: '/task-rhymejudgment_bold.json',
    size: null as unknown as number,
    ignored: false,
    stream: null as unknown as ReadableStream<Uint8Array>,
    text: () => Promise.resolve(''),
  }
  const context = readEntities(testFile)
  assert(context.suffix === 'bold', 'failed to match suffix')
  assert(context.extension === '.json', 'failed to match extension')
  assert(context.entities.task === 'rhymejudgment', 'failed to match extension')
})
