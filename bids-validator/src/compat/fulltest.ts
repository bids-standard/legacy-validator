/** Adapter to run Node.js bids-validator fullTest with minimal changes from Deno */
import { ValidatorOptions } from '../setup/options.ts'
import { FileTree } from '../files/filetree.ts'
import { walkFileTree } from '../schema/walk.ts'
import { Issue } from '../types/issues.ts'
import validate from '../../dist/esm/index.js'
import { AdapterFile } from './adapter-file.ts'

export async function fullTestAdapter(
  tree: FileTree,
  options: ValidatorOptions,
) {
  const fileList: Array<AdapterFile> = []
  for await (const context of walkFileTree(tree)) {
    const stream = await context.file.stream
    const file = new AdapterFile(context.dataset.path, context.file, stream)
    fileList.push(file)
  }
  validate.BIDS(
    fileList,
    options,
    (issues: Issue[], summary: Record<string, any>) => {
      console.log(issues)
      console.log(summary)
    },
  )
}
