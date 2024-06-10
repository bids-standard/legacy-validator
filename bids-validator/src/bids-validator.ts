import { main } from './main.ts'

const result = await main()

for (const issue of result.issues.values()) {
  if (issue.severity === 'error') {
    Deno.exit(1)
  }
}
