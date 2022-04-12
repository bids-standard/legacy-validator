import { BIDSContext } from './context.ts'
import { FileTree } from '../files/filetree.ts'

/** Recursive algorithm for visiting each file in the dataset, creating a context */
export async function* _walkFileTree(
  fileTree: FileTree,
  root: FileTree,
): AsyncIterable<BIDSContext> {
  for (const file of fileTree.files) {
    yield new BIDSContext(root, file)
  }
  for (const dir of fileTree.directories) {
    yield* _walkFileTree(dir, root)
  }
}

/** Walk all files in the dataset and construct a context for each one */
export async function* walkFileTree(
  fileTree: FileTree,
): AsyncIterable<BIDSContext> {
  yield* _walkFileTree(fileTree, fileTree)
}
