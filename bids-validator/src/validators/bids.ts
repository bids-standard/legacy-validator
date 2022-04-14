import { Issue } from '../types/issues.ts'
import { FileTree } from '../files/filetree.ts'
import { walkFileTree } from '../schema/walk.ts'
import { loadSchema } from '../setup/loadSchema.ts'
import { applyRules } from '../schema/applyRules.ts'

/**
 * Full BIDS schema validation entrypoint
 */
export async function validate(fileTree: FileTree): Promise<Issue[]> {
  const issues = []
  const schemaDefs = await loadSchema()
  for await (const context of walkFileTree(fileTree)) {
    issues.push(...applyRules(schemaDefs, context))    
  }
  return issues
}
