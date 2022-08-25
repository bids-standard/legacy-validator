import { readFileTree } from '../../files/deno.ts'
import { FileTree } from '../../types/filetree.ts'
import { validate } from '../../validators/bids.ts'
import { ValidationResult } from '../../types/validation-result.ts'
import { Issue } from '../../types/issues.ts'
import { DatasetIssues } from '../../issues/datasetIssues.ts'
import { Summary } from '../../summary/summary.ts'

export async function validatePath(
  t: Deno.TestContext,
  path: string,
): Promise<{ tree: FileTree; result: ValidationResult }> {
  let tree: FileTree = new FileTree('', '')
  let summary = new Summary()
  let result: ValidationResult = {
    issues: new DatasetIssues(),
    summary: summary.formatOutput(),
  }

  await t.step('file tree is read', async () => {
    tree = await readFileTree(path)
  })

  await t.step('completes validation', async () => {
    result = await validate(tree)
  })

  return { tree, result }
}

export function formatAssertIssue(message: string, issue?: Issue) {
  if (issue) {
    return `${message}\n${Deno.inspect(issue, { depth: 8, colors: true })}`
  } else {
    return `${message}\nAsserted issue is undefined`
  }
}
