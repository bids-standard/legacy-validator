/** Adapter to run Node.js bids-validator fullTest with minimal changes from Deno */
import { ValidatorOptions } from '../setup/options.ts'
import { FileTree } from '../types/filetree.ts'
import { walkFileTree } from '../schema/walk.ts'
import { FullTestIssuesReturn } from '../types/issues.ts'
import validate from '../../dist/esm/index.js'
import { AdapterFile } from './adapter-file.ts'

export interface FullTestAdapterReturn {
  issues: FullTestIssuesReturn
  summary: Record<string, any>
}

export async function fullTestAdapter(
  tree: FileTree,
  options: ValidatorOptions,
): Promise<FullTestAdapterReturn> {
  const fileList: Array<AdapterFile> = []
  for await (const context of walkFileTree(tree, undefined)) {
    const stream = await context.file.stream
    const file = new AdapterFile(context.datasetPath, context.file, stream)
    fileList.push(file)
  }
  return new Promise((resolve) => {
    validate.BIDS(
      fileList,
      options,
      (issues: FullTestIssuesReturn, summary: Record<string, any>) => {
        resolve({ issues, summary })
      },
    )
  })
}
