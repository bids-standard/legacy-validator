import { parseOptions } from './setup/options.ts'
import { readFileTree } from './files/deno.ts'
import { resolve } from './deps/path.ts'
import { fullTestAdapter } from './compat/fulltest.ts'

async function main() {
  const options = parseOptions(Deno.args)
  const absolutePath = resolve(options._[0])
  const tree = await readFileTree(absolutePath)
  await fullTestAdapter(tree, options)
}

await main()
