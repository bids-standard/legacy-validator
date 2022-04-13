import { Issue } from '../types/issues.ts'
import { FileTree } from '../files/filetree.ts'
import { loadSchema } from '../setup/loadSchema.ts'

/**
 * Full BIDS validation entrypoint
 */
export async function validate(fileTree: FileTree): Promise<Issue[]> {
  const schemaDefs = loadSchema()
  return []
}
