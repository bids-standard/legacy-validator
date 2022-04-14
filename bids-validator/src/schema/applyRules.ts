import { Issue, ignore } from '../types/issues.ts'
import { Schema } from '../types/schema.ts'
import { BIDSContext } from './context.ts'

/**
 * Given a schema and context, evaluate which rules match and test them
 * @param schema
 * @param context
 */
export function applyRules(schema: Schema, context: BIDSContext): Issue[] {
  const issues: Issue[] = []
  console.log(context)
  return issues
}