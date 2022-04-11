import { BIDSContext } from './context.ts'
import { FileTree } from '../files/filetree.ts'

/** Algorithm for visiting each file in the dataset, creating a context */
export async function* walkFileTree(
  fileTree: FileTree,
  root: FileTree,
): AsyncIterable<BIDSContext> {
  for (const file of fileTree.files) {
    yield new BIDSContext(root, file)
  }
  for (const dir of fileTree.directories) {
    yield* walkFileTree(dir, root)
  }
}
