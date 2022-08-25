import { GenericRule, GenericSchema, SchemaFields } from '../types/schema.ts'
import { Severity } from '../types/issues.ts'
import { BIDSContext } from './context.ts'

/**
 * Given a schema and context, evaluate which rules match and test them.
 * Recursively descend into schema object and iterate over each levels keys.
 * If we find a child of the object that isn't an Object ignore it, this will
 * be things that show up in meta and objects directories. If an an object
 * has a selectors key we know that this is an actual rule that we know how
 * to evaluate. Finally if what we have is an Object recurse on it to see if
 * its children have any rules.
 * @param schema
 * @param context
 */
export function applyRules(schema: GenericSchema, context: BIDSContext) {
  for (const key in schema) {
    if (!(schema[key].constructor === Object)) {
      continue
    }
    if ('selectors' in schema[key]) {
      evalRule(schema[key] as GenericRule, context)
    } else if (schema[key].constructor === Object) {
      applyRules(schema[key] as GenericSchema, context)
    }
  }
  return Promise.resolve()
}

const evalConstructor = (src: string): Function =>
  new Function('context', `with (context) { return ${src} }`)
const safeHas = () => true
const safeGet = (target: any, prop: any) =>
  prop === Symbol.unscopables ? undefined : target[prop]

export function evalCheck(src: string, context: BIDSContext) {
  const test = evalConstructor(src)
  const safeContext = new Proxy(context, { has: safeHas, get: safeGet })
  try {
    return test(safeContext)
  } catch (error) {
    return false
  }
}

/**
 * Different keys in a rule have different interpretations.
 * We associate theys keys from a rule object to a function adds an
 * issue to the context if the rule evaluation fails.
 */
const evalMap: Record<
  keyof Omit<GenericRule, 'selectors' | 'issue'>,
  (rule: GenericRule, context: BIDSContext) => boolean | void
> = {
  checks: evalRuleChecks,
  columns: evalColumns,
  additional_columns: evalAdditionalColumns,
  initial_columns: evalInitialColumns,
  fields: evalJsonCheck,
}

/**
 * Entrypoint for evaluating a individual rule.
 * We see if every selector applies to this context,
 * Then we attempt to interpret every other key in the rule
 * object.
 */
function evalRule(rule: GenericRule, context: BIDSContext) {
  if (!mapEvalCheck(rule.selectors, context)) {
    return
  }
  Object.keys(rule)
    .filter((key) => key in evalMap)
    .map((key) => {
      // @ts-expect-error
      evalMap[key](rule, context)
    })
}

function mapEvalCheck(statements: string[], context: BIDSContext): boolean {
  return statements.every((x) => evalCheck(x, context))
}

/**
 * Classic rules interpreted like selectors. Examples in specification:
 * schema/rules/checks/*
 */
function evalRuleChecks(rule: GenericRule, context: BIDSContext): boolean {
  if (rule.checks && !mapEvalCheck(rule.checks, context)) {
    if (rule.issue?.code && rule.issue?.message) {
      context.issues.add({
        key: rule.issue.code,
        reason: rule.issue.message,
        files: [{ ...context.file }],
      })
    } else {
      context.issues.addNonSchemaIssue('CHECK_ERROR', [
        { ...context.file, evidence: JSON.stringify(rule) },
      ])
    }
  }
  return true
}

/**
 * Columns in schema rules are assertions about the requirement level of what
 * headers should be present in a tsv file. Examples in specification:
 * schema/rules/tabular_data/*
 */
function evalColumns(rule: GenericRule, context: BIDSContext): void {
  if (!rule.columns) return
  const headers = Object.keys(context.columns)
  for (const [ruleHeader, requirement] of Object.entries(rule.columns)) {
    if (!headers.includes(ruleHeader) && requirement === 'required') {
      context.issues.addNonSchemaIssue('TSV_ERROR', [
        { ...context.file, evidence: JSON.stringify(rule) },
      ])
    }
  }
}

/**
 * A small subset of tsv schema rules enforce a specific order of columns.
 * No error is currently provided by the rule itself.
 */
function evalInitialColumns(rule: GenericRule, context: BIDSContext): void {
  if (!rule?.columns || !rule?.initial_columns) return
  const headers = Object.keys(context.columns)
  rule.initial_columns.map((ruleHeader: string, ruleIndex: number) => {
    const contextIndex = headers.findIndex((x) => x === ruleHeader)
    if (contextIndex === -1) {
      const evidence = `Column with header ${ruleHeader} not found, indexed from 0 it should appear in column ${contextIndex}`
      context.issues.addNonSchemaIssue('TSV_COLUMN_MISSING', [
        { ...context.file, evidence: evidence },
      ])
    } else if (ruleIndex !== contextIndex) {
      const evidence = `Column with header ${ruleHeader} found at index ${ruleIndex} while rule specifies, indexed form 0 it should be in column ${contextIndex}`
      context.issues.addNonSchemaIssue('TSV_COLUMN_ORDER_INCORRECT', [
        { ...context.file, evidence: evidence },
      ])
    }
  })
}

function evalAdditionalColumns(rule: GenericRule, context: BIDSContext): void {
  const headers = Object.keys(context?.columns)
  // hard coding allowed here feels bad
  if (!(rule.additional_columns === 'allowed')) {
    const extraCols = headers.filter(
      (header) => rule.columns && !(header in rule.columns),
    )
    if (extraCols.length) {
      context.issues.addNonSchemaIssue('TSV_ADDITIONAL_COLUMNS_NOT_ALLOWED', [
        { ...context.file, evidence: `Disallowed columns found ${extraCols}` },
      ])
    }
  }
}

/**
 * For evaluating field requirements and values that should exist in a json
 * sidecar for a file. Will need to implement an additional check/error for
 * `prohibitied` fields. Examples in specification:
 * schema/rules/sidecars/*
 *
 */
function evalJsonCheck(rule: GenericRule, context: BIDSContext): void {
  for (const [key, requirement] of Object.entries(rule.fields)) {
    const severity = getFieldSeverity(requirement, context)
    if (severity && severity !== 'ignore' && !(key in context.sidecar)) {
      if (requirement.issue?.code && requirement.issue?.message) {
        context.issues.add({
          key: requirement.issue.code,
          reason: requirement.issue.message,
          severity,
          files: [{ ...context.file }],
        })
      } else {
        context.issues.addNonSchemaIssue('JSON_KEY_REQUIRED', [
          { ...context.file, evidence: `missing ${key}` },
        ])
      }
    }
  }
}

/**
 * JSON Field checks have conditions where their requirement levels can
 * change based on some other field. This function resolves the severity
 * of a JsonCheckFailure depending on how the checks level object is shaped.
 */
function getFieldSeverity(
  requirement: string | SchemaFields,
  context: BIDSContext,
): Severity {
  // Does this conversion hold for other parts of the schema or just json checks?
  const levelToSeverity: Record<string, Severity> = {
    recommended: 'ignore',
    required: 'error',
    optional: 'ignore',
    prohibited: 'ignore',
  }
  let severity: Severity = 'ignore'

  if (typeof requirement === 'string' && requirement in levelToSeverity) {
    severity = levelToSeverity[requirement]
  } else if (typeof requirement === 'object' && requirement.level) {
    severity = levelToSeverity[requirement.level]
    const addendumRegex = /(required|recommended) if \`(\w+)\` is \`(\w+)\`/
    if (requirement.level_addendum) {
      const match = addendumRegex.exec(requirement.level_addendum)
      if (match && match.length === 4) {
        const [addendum, addendumLevel, key, value] = match
        // @ts-expect-error
        if (key in context.sidecar && context.sidecar[key] === value) {
          severity = levelToSeverity[addendumLevel]
        }
      }
    }
  }
  return severity
}
