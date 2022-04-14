// Loading schema yaml files from local filesystem
import { join, fromFileUrl, relative, parse as pathParse, SEP } from '../deps/path.ts'
import { parse as yamlParse } from '../deps/yaml.ts'
import { walk } from '../deps/fs.ts'
import { Schema } from '../types/schema.ts'

// TODO - This can't depend on Deno later, must support all environments
const yamlBasePath = join(
  fromFileUrl(import.meta.url),
  '..',
  '..',
  '..',
  'spec',
  'src',
  'schema',
)

export async function loadSchema(): Promise<Schema> {
  const schemaObj = {}
  for await (const entry of walk(yamlBasePath, {
    includeDirs: false,
    exts: ['yaml'],
  })) {
    const yamlPath = relative(yamlBasePath, entry.path)
    const yamlPathParsed = pathParse(yamlPath)
    const yamlPathComponents = yamlPathParsed.dir.split(SEP)
    const yamlPathName = yamlPathParsed.name

    let lastLevel = schemaObj
    for (const level of yamlPathComponents) {
      (lastLevel as any)[level] = (schemaObj as any)[level] || {}
      lastLevel = (lastLevel as any)[level]
    }

    // Parse and load the schema definition
    (lastLevel as any)[yamlPathName] = await yamlParse(await Deno.readTextFile(entry.path))
  }
  return (schemaObj as Schema)
}
