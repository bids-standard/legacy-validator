import { parseOptions } from './setup/options.ts'
import { readFileTree } from './files/deno.ts'
import { resolve } from './deps/path.ts'
import { fullTestAdapter } from './compat/fulltest.ts'
import { validate } from './validators/bids.ts'

async function main() {
  const options = parseOptions(Deno.args)
  const absolutePath = resolve(options._[0])
  const tree = await readFileTree(absolutePath)

  // Run the schema based validator
  const schemaIssues = await validate(tree)

  const { issues, summary } = await fullTestAdapter(tree, options)
  const inspectOpts = {
    depth: 6,
    colors: true,
  }
  console.log(Deno.inspect(schemaIssues.concat(issues), inspectOpts))
  console.log(Deno.inspect(summary, inspectOpts))
}

await main()
