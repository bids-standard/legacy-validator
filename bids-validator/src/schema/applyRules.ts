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

const evalConstructor = (src: string): Function =>
  new Function('context', `with (context) { return ${src} }`)
const safeHas = () => true
const safeGet = (target: any, prop: any) =>
  prop === Symbol.unscopables ? undefined : target[prop]

export function evalCheck(src: string, context: Record<string, any>) {
  const test = evalConstructor(src)
  const safeContext = new Proxy(context, { has: safeHas, get: safeGet })
  try {
    return test(safeContext)
  } catch (error) {
    console.error(error)
  }
}
