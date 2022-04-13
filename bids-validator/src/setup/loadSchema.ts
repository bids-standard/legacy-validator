// Simplified version of the remote loading schemaTypes implementation
import { join, fromFileUrl } from '../deps/path.ts'
import { parse } from '../deps/yaml.ts'

// TODO - This can't depend on Deno later, must support all environments
const yamlBasePath = join(
  fromFileUrl(Deno.mainModule),
  '..',
  '..',
  'spec',
  'src',
  'schema'
)

/**
 * Returns a loaded and parsed yaml file
 * @param path Relative path components from main.ts
 */
async function parseYaml(paths: string[]) {
  const filePath = join(yamlBasePath, ...paths)
  const parsed = parse(await Deno.readTextFile(filePath))
  return parsed
}

export interface SchemaDictionary {
  objects: unknown
  rules: unknown
}

export async function loadSchema(): Promise<SchemaDictionary> {
  for await (const dirEntry of Deno.readDir(yamlBasePath)) {
    //console.log(dirEntry)
  }
  return { objects: '', rules: ''}
  /*
  return {
    top_level_files: await parseYaml(['rules', 'top_level_files.yaml']),
    entities: await parseYaml(['rules', 'entities.yaml']),
    datatypes: {
      anat: await parseYaml(['rules', 'datatypes', 'anat.yaml']),
    },
  }*/
}
