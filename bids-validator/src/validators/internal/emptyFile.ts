import { CheckFunction } from '../../types/check.ts'

// Non-schema EMPTY_FILE implementation
export const emptyFile: CheckFunction = (schema, context) => {
  if (context.file.size === 0) {
    context.issues.addNonSchemaIssue('EMPTY_FILE', [context.file])
  }
  return Promise.resolve()
}
