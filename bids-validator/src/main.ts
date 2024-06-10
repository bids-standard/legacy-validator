import { parseOptions } from './setup/options.ts'
import { readFileTree } from './files/deno.ts'
import { fileListToTree } from './files/browser.ts'
import { resolve } from './deps/path.ts'
import { validate } from './validators/bids.ts'
import { consoleFormat } from './utils/output.ts'
import { setupLogging } from './utils/logger.ts'
import type { ValidationResult } from './types/validation-result.ts'

export async function main(): Promise<ValidationResult> {
  const options = await parseOptions(Deno.args)
  setupLogging(options.debug)
  const absolutePath = resolve(options.datasetPath)
  const tree = await readFileTree(absolutePath)

  // Run the schema based validator
  const schemaResult = await validate(tree, options)

  if (options.json) {
    console.log(
      JSON.stringify(schemaResult, (key, value) => {
        if (value instanceof Map) {
          return Array.from(value.values())
        } else {
          return value
        }
      }),
    )
  } else {
    console.log(
      consoleFormat(schemaResult, {
        verbose: options.verbose ? options.verbose : false,
      }),
    )
  }

  return schemaResult
}

export { validate, fileListToTree }
