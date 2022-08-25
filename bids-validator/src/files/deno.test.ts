import { assertEquals, assertRejects } from '../deps/asserts.ts'
import { readAll, readerFromStreamReader } from '../deps/stream.ts'
import { dirname, basename, join } from '../deps/path.ts'
import { BIDSFileDeno, UnicodeDecodeError } from './deno.ts'
import { requestReadPermission } from '../setup/requestPermissions.ts'
import { FileIgnoreRulesDeno } from './ignore.ts'

await requestReadPermission()

// Use this file for testing file behavior
const testUrl = import.meta.url
const testPath = testUrl.slice('file://'.length)
const testDir = dirname(testPath)
const testFilename = basename(testPath)
const ignore = new FileIgnoreRulesDeno([])

Deno.test('Deno implementation of BIDSFile', async t => {
  await t.step('implements basic file properties', () => {
    const file = new BIDSFileDeno(testDir, testFilename, ignore)
    assertEquals(join(testDir, file.path), testPath)
  })
  await t.step('implements correct file size', async () => {
    const { size } = await Deno.stat(testPath)
    const file = new BIDSFileDeno(testDir, testFilename, ignore)
    assertEquals(await file.size, size)
  })
  await t.step('can be read as ReadableStream', async () => {
    const file = new BIDSFileDeno(testDir, testFilename, ignore)
    const stream = file.stream
    const streamReader = stream.getReader()
    const denoReader = readerFromStreamReader(streamReader)
    const fileBuffer = await readAll(denoReader)
    assertEquals(await file.size, fileBuffer.length)
  })
  await t.step('can be read with .text() method', async () => {
    const file = new BIDSFileDeno(testDir, testFilename, ignore)
    const text = await file.text()
    assertEquals(await file.size, text.length)
  })
  await t.step(
    'throws UnicodeDecodeError when reading a UTF-16 file with text() method',
    async () => {
      // BOM is invalid in JSON but shows up often from certain tools, so abstract handling it
      const bomDir = join(testPath, '..', '..', 'tests')
      const bomFilename = 'bom-utf16.tsv'
      const file = new BIDSFileDeno(bomDir, bomFilename, ignore)
      await assertRejects(async () => file.text(), UnicodeDecodeError)
  })
  await t.step(
    'strips BOM characters when reading UTF-8 via .text()',
    async () => {
      // BOM is invalid in JSON but shows up often from certain tools, so abstract handling it
      const bomDir = join(testPath, '..', '..', 'tests')
      const bomFilename = 'bom-utf8.json'
      const file = new BIDSFileDeno(bomDir, bomFilename, ignore)
      const text = await file.text()
      assertEquals(text, '{\n  "example": "JSON for test suite"\n}\n')
    },
  )
})
