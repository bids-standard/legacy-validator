/** Adapter to run Node.js bids-validator fullTest with minimal changes from Deno */
import { ValidatorOptions } from './setup/options.ts'
import { FileTree, BIDSFile } from './files/filetree.ts'
import { walkFileTree } from './schema/walk.ts'
import { Issue } from './types/issues.ts'
import validate from '../dist/esm/index.js'

class AdapterFile {
  private _file: BIDSFile
  path: string
  webkitRelativePath: string
  constructor(file: BIDSFile) {
    this._file = file
    this.path = file.name
    this.webkitRelativePath = file.name
  }
}

export async function fullTestAdapter(
  tree: FileTree,
  options: ValidatorOptions,
) {
  const fileList: Array<AdapterFile> = []
  for await (const context of walkFileTree(tree)) {
    fileList.push(new AdapterFile(context.file))
  }

  validate.BIDS(fileList, options, (issues: Issue[], summary: Record<string, any>) => {
    console.log(issues)
    console.log(summary)
  })
}
