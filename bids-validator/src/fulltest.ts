/** Adapter to run Node.js bids-validator fullTest with minimal changes from Deno */
import { ValidatorOptions } from './setup/options.ts'
import { FileTree, BIDSFile } from './files/filetree.ts'
import { walkFileTree } from './schema/walk.ts'
import { Issue } from './types/issues.ts'
import validate from '../dist/esm/index.js'

class AdapterFile {
  name: string
  webkitRelativePath: string
  constructor(path: string, file: BIDSFile) {
    // JS validator expects dataset-dir/contents filenames
    this.name = `${path}/${file.name}`
    this.webkitRelativePath = this.name
  }
}

export async function fullTestAdapter(
  tree: FileTree,
  options: ValidatorOptions,
) {
  const fileList: Array<AdapterFile> = []
  for await (const context of walkFileTree(tree)) {
    fileList.push(new AdapterFile(tree.name, context.file))
  }

  console.log(fileList)

  validate.BIDS(fileList, options, (issues: Issue[], summary: Record<string, any>) => {
    console.log(issues)
    console.log(summary)
  })
}
