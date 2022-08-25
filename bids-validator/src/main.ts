import { parseOptions } from './setup/options.ts'
import { readFileTree } from './files/deno.ts'
import { resolve } from './deps/path.ts'
import { fullTestAdapter } from './compat/fulltest.ts'
import { validate } from './validators/bids.ts'
import { consoleFormat } from './utils/output.ts'

function inspect(obj: any) {
  console.log(
    Deno.inspect(obj, {
      depth: 6,
      colors: true,
    }),
  )
}

async function main() {
  const options = parseOptions(Deno.args)
  const absolutePath = resolve(options._[0])
  const tree = await readFileTree(absolutePath)

  // Run the schema based validator
  const schemaResult = await validate(tree)

  if (options.schemaOnly) {
    if (options.json) {
      console.log(inspect(schemaResult))
    } else {
      console.log(consoleFormat(schemaResult))
    }
  } else {
    const output = schemaResult.issues.formatOutput()
    const legacyResult = await fullTestAdapter(tree, options)
    output.errors.push(...legacyResult.issues.errors)
    output.warnings.push(...legacyResult.issues.warnings)
    inspect(output)
    inspect(legacyResult.summary)
  }
}

await main()
