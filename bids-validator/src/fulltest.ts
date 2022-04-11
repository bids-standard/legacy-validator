/** Adapter to run Node.js bids-validator fullTest with minimal changes from Deno */
import { ValidatorOptions } from './setup/options.ts'
import { FileTree, BIDSFile } from './files/filetree.ts'
import { walkFileTree } from './schema/walk.ts'
import { Issue } from './types/issues.ts'
import { relative, resolve } from './deps/path.ts'
import validate from '../dist/esm/index.js'

/**
 * File class modeled off browser File for validator
 */
class AdapterFile {
  name: string // Filename
  path: string // Absolute path
  relativePath: string // Dataset relative path (prefixed /)
  webkitRelativePath: string // Duplicate name for relativePath
  constructor(rootPath: string, file: BIDSFile) {
    this.name = file.name
    // JS validator expects dataset-dir/contents filenames
    const relativePath = relative(rootPath, file.path)
    this.relativePath = `/${relativePath}`
    this.webkitRelativePath = this.relativePath
    this.path = resolve(rootPath, file.path)
  }
}

export async function fullTestAdapter(
  tree: FileTree,
  options: ValidatorOptions,
) {
  const fileList: Array<AdapterFile> = []
  for await (const context of walkFileTree(tree, tree)) {
    const file = new AdapterFile(context.dataset.path, context.file)
    fileList.push(file)
  }
  validate.BIDS(fileList, options, (issues: Issue[], summary: Record<string, any>) => {
    console.log(issues)
    console.log(summary)
  })
}
