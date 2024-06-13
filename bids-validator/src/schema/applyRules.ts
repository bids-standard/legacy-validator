import {
  GenericRule,
  GenericSchema,
  SchemaFields,
  SchemaTypeLike,
} from "../types/schema.ts";
import { Severity } from "../types/issues.ts";
import { BIDSContext } from "./context.ts";
import { expressionFunctions } from "./expressionLanguage.ts";
import { logger } from "../utils/logger.ts";
import { memoize } from "../utils/memoize.ts";

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
export function applyRules(
  schema: GenericSchema,
  context: BIDSContext,
  rootSchema?: GenericSchema,
  schemaPath?: string,
) {
  if (!rootSchema) {
    rootSchema = schema;
  }
  if (!schemaPath) {
    schemaPath = "schema.rules";
  }
  Object.assign(context, expressionFunctions);
  // @ts-expect-error
  context.exists.bind(context);
  for (const key in schema) {
    if (!(schema[key].constructor === Object)) {
      continue;
    }
    if ("selectors" in schema[key]) {
      evalRule(
        schema[key] as GenericRule,
        context,
        rootSchema,
        `${schemaPath}.${key}`,
      );
    } else if (schema[key].constructor === Object) {
      applyRules(
        schema[key] as GenericSchema,
        context,
        rootSchema,
        `${schemaPath}.${key}`,
      );
    }
  }
  return Promise.resolve();
}

const evalConstructor = (src: string): Function =>
  new Function("context", `with (context) { return ${src} }`);
const safeHas = () => true;
const safeGet = (target: any, prop: any) =>
  prop === Symbol.unscopables ? undefined : target[prop];

const memoizedEvalConstructor = memoize(evalConstructor);

export function evalCheck(src: string, context: BIDSContext) {
  const test = memoizedEvalConstructor(src);
  const safeContext = new Proxy(context, { has: safeHas, get: safeGet });
  try {
    return test(safeContext);
  } catch (error) {
    logger.debug(error);
    return null;
  }
}

/**
 * Different keys in a rule have different interpretations.
 * We associate theys keys from a rule object to a function adds an
 * issue to the context if the rule evaluation fails.
 */
// @ts-expect-error
const evalMap: Record<
  keyof GenericRule,
  (
    rule: GenericRule,
    context: BIDSContext,
    schema: GenericSchema,
    schemaPath: string,
  ) => boolean | void
> = {
  checks: evalRuleChecks,
  columns: evalColumns,
  additional_columns: evalAdditionalColumns,
  initial_columns: evalInitialColumns,
  index_columns: evalIndexColumns,
  fields: evalJsonCheck,
};

/**
 * Entrypoint for evaluating a individual rule.
 * We see if every selector applies to this context,
 * Then we attempt to interpret every other key in the rule
 * object.
 */
function evalRule(
  rule: GenericRule,
  context: BIDSContext,
  schema: GenericSchema,
  schemaPath: string,
) {
  if (rule.selectors && !mapEvalCheck(rule.selectors, context)) {
    return;
  }
  Object.keys(rule)
    .filter((key) => key in evalMap)
    .map((key) => {
      // @ts-expect-error
      evalMap[key](rule, context, schema, schemaPath);
    });
}

function mapEvalCheck(statements: string[], context: BIDSContext): boolean {
  return statements.every((x) => evalCheck(x, context));
}

/**
 * Classic rules interpreted like selectors. Examples in specification:
 * schema/rules/checks/*
 */
function evalRuleChecks(
  rule: GenericRule,
  context: BIDSContext,
  schema: GenericSchema,
  schemaPath: string,
): boolean {
  if (rule.checks && !mapEvalCheck(rule.checks, context)) {
    if (rule.issue?.code && rule.issue?.message) {
      context.issues.add({
        key: rule.issue.code,
        reason: rule.issue.message,
        files: [{ ...context.file, evidence: schemaPath }],
        severity: rule.issue.level as Severity,
      });
    } else {
      context.issues.addNonSchemaIssue("CHECK_ERROR", [
        { ...context.file, evidence: schemaPath },
      ]);
    }
  }
  return true;
}

/**
 * schema.formats contains named types with patterns. Many entries in
 * schema.objects have a format to constrain its possible values. Presently
 * this is written with tsv's in mind. The blanket n/a pass may be inappropriate
 * for other type checks. filenameValidate predates this but does similar type
 * checking for entities.
 */
function schemaObjectTypeCheck(
  schemaObject: SchemaTypeLike,
  value: string,
  schema: GenericSchema,
): boolean {
  // always allow n/a?
  if (value === "n/a") {
    return true;
  }
  if ("anyOf" in schemaObject) {
    return schemaObject.anyOf.some((x) =>
      schemaObjectTypeCheck(x, value, schema)
    );
  }
  if ("enum" in schemaObject && schemaObject.enum) {
    return schemaObject.enum.some((x) => x === value);
  }
  // @ts-expect-error
  const format = schema.objects.formats[schemaObject.type];
  const re = new RegExp(`^${format.pattern}$`);
  return re.test(value);
}

/**
 * Checks user supplied type information from a sidecar against tsv column value.
 */
function sidecarDefinedTypeCheck(
  rule: object,
  value: string,
  schema: GenericSchema,
): boolean {
  if (
    "Levels" in rule && rule["Levels"] && typeof (rule["Levels"]) == "object"
  ) {
    return value == 'n/a' || value in rule["Levels"];
  } else if ("Units" in rule) {
    return schemaObjectTypeCheck({ "type": "number" }, value, schema);
  } else {
    return true;
  }
}

/**
 * Columns in schema rules are assertions about the requirement level of what
 * headers should be present in a tsv file. Examples in specification:
 * schema/rules/tabular_data/*
 *
 * For each column in a rule.tabluar_data check we generate an error if the
 * column is missing from the tsv and listed as required by the schema, a
 * warning if the schema rule is clobbered by the sidecar but shouldn't be. If
 * the column is not in the tsv we bail out and move to the next column,
 * otherwise we type check each value in the column according to the type
 * specified in the schema rule (or sidecar type information if applicable).
 */
function evalColumns(
  rule: GenericRule,
  context: BIDSContext,
  schema: GenericSchema,
  schemaPath: string,
): void {
  if (!rule.columns || context.extension !== ".tsv") return;
  const headers = [...Object.keys(context.columns)];
  for (const [ruleHeader, requirement] of Object.entries(rule.columns)) {
    // @ts-expect-error
    const columnObject: GenericRule = schema.objects.columns[ruleHeader];
    if (!("name" in columnObject) || !columnObject["name"]) {
      return;
    }
    const name = columnObject.name;
    let typeCheck = (value: string) =>
      schemaObjectTypeCheck(
        columnObject as unknown as SchemaTypeLike,
        value,
        schema,
      );
    const error_code = (requirement != "required")
      ? "TSV_VALUE_INCORRECT_TYPE_NONREQUIRED"
      : "TSV_VALUE_INCORRECT_TYPE";
    let errorObject = columnObject;

    if (!headers.includes(name) && requirement === "required") {
      context.issues.addNonSchemaIssue("TSV_COLUMN_MISSING", [
        {
          ...context.file,
          evidence:
            `Column with header ${name} listed as required. ${schemaPath}`,
        },
      ]);
    }

    if ("definition" in columnObject) {
      typeCheck = (value) =>
        // @ts-expect-error
        sidecarDefinedTypeCheck(columnObject.definition, value, schema);
    }

    if (
      name in context.sidecar && context.sidecar[name] &&
      typeof (context.sidecar[name]) === "object"
    ) {
      if ("definition" in columnObject) {
        typeCheck = (value) =>
          sidecarDefinedTypeCheck(context.sidecar[name], value, schema);
        errorObject = context.sidecar[name];
      } else {
        context.issues.addNonSchemaIssue("TSV_COLUMN_TYPE_REDEFINED", [{
          ...context.file,
          evidence: `'${name}' redefined with sidecar ${
            Deno.inspect(context.sidecar[name])
          }`,
        }]);
      }
    }

    if (!headers.includes(name)) {
      continue;
    }

    for (const value of context.columns[name] as string[]) {
      if (
        !typeCheck(value)
      ) {
        context.issues.addNonSchemaIssue(error_code, [
          {
            ...context.file,
            evidence: `'${value}' ${Deno.inspect(columnObject)}`,
          },
        ]);
        break;
      }
    }
  }
}

/**
 * A small subset of tsv schema rules enforce a specific order of columns.
 * No error is currently provided by the rule itself.
 */
function evalInitialColumns(
  rule: GenericRule,
  context: BIDSContext,
  schema: GenericSchema,
  schemaPath: string,
): void {
  if (
    !rule?.columns || !rule?.initial_columns || context.extension !== ".tsv"
  ) {
    return;
  }
  const headers = [...Object.keys(context.columns)];
  rule.initial_columns.map((ruleHeader: string, ruleIndex: number) => {
    // @ts-expect-error
    const ruleHeaderName = schema.objects.columns[ruleHeader].name;
    const contextIndex = headers.findIndex((x) => x === ruleHeaderName);
    if (contextIndex === -1) {
      const evidence =
        `Column with header ${ruleHeaderName} not found, indexed from 0 it should appear in column ${ruleIndex}. ${schemaPath}`;
      context.issues.addNonSchemaIssue("TSV_COLUMN_MISSING", [
        { ...context.file, evidence: evidence },
      ]);
    } else if (ruleIndex !== contextIndex) {
      const evidence =
        `Column with header ${ruleHeaderName} found at index ${contextIndex} while rule specifies, indexed from 0, it should be in column ${ruleIndex}. ${schemaPath}`;
      context.issues.addNonSchemaIssue("TSV_COLUMN_ORDER_INCORRECT", [
        { ...context.file, evidence: evidence },
      ]);
    }
  });
}

function evalAdditionalColumns(
  rule: GenericRule,
  context: BIDSContext,
  schema: GenericSchema,
  schemaPath: string,
): void {
  if (context.extension !== ".tsv") return;
  const headers = Object.keys(context?.columns);
  // hard coding allowed here feels bad
  if (!(rule.additional_columns === "allowed") && rule.columns) {
    const ruleHeadersNames = Object.keys(rule.columns).map(
      // @ts-expect-error
      (x) => schema.objects.columns[x].name,
    );
    let extraCols = headers.filter(
      (header) => !ruleHeadersNames.includes(header),
    );
    if (rule.additional_columns === "allowed_if_defined") {
      extraCols = extraCols.filter((header) => !(header in context.sidecar));
    }
    if (extraCols.length) {
      context.issues.addNonSchemaIssue("TSV_ADDITIONAL_COLUMNS_NOT_ALLOWED", [
        { ...context.file, evidence: `Disallowed columns found ${extraCols}` },
      ]);
    }
  }
}

function evalIndexColumns(
  rule: GenericRule,
  context: BIDSContext,
  schema: GenericSchema,
  schemaPath: string,
): void {
  if (
    !rule?.columns ||
    !rule?.index_columns ||
    !rule?.index_columns.length ||
    context.extension !== ".tsv"
  ) {
    return;
  }
  const headers = Object.keys(context?.columns);
  const uniqueIndexValues = new Set();
  const index_columns = rule.index_columns.map((col: string) => {
    // @ts-expect-error
    return schema.objects.columns[col].name;
  });
  const missing = index_columns.filter((col: string) => !headers.includes(col));
  if (missing.length) {
    context.issues.addNonSchemaIssue("TSV_COLUMN_MISSING", [
      {
        ...context.file,
        evidence:
          `Columns cited as index columns not in file: ${missing}. ${schemaPath}`,
      },
    ]);
    return;
  }
  const rowCount = (context.columns[index_columns[0]] as string[])?.length || 0;
  for (let i = 0; i < rowCount; i++) {
    let indexValue = "";
    index_columns.map((col: string) => {
      indexValue = indexValue.concat(
        (context.columns[col] as string[])?.[i] || "",
      );
    });
    if (uniqueIndexValues.has(indexValue)) {
      context.issues.addNonSchemaIssue("TSV_INDEX_VALUE_NOT_UNIQUE", [
        { ...context.file, evidence: `Row: ${i + 2}, Value: ${indexValue}` },
      ]);
    } else {
      uniqueIndexValues.add(indexValue);
    }
  }
}

/**
 * For evaluating field requirements and values that should exist in a json
 * sidecar for a file. Will need to implement an additional check/error for
 * `prohibitied` fields. Examples in specification:
 * schema/rules/sidecars/*
 */
function evalJsonCheck(
  rule: GenericRule,
  context: BIDSContext,
  schema: GenericSchema,
  schemaPath: string,
): void {
  for (const [key, requirement] of Object.entries(rule.fields)) {
    const severity = getFieldSeverity(requirement, context);
    // @ts-expect-error
    const keyName = schema.objects.metadata[key].name;
    if (severity && severity !== "ignore" && !(keyName in context.sidecar)) {
      if (requirement.issue?.code && requirement.issue?.message) {
        context.issues.add({
          key: requirement.issue.code,
          reason: requirement.issue.message,
          severity,
          files: [{ ...context.file }],
        });
      } else {
        context.issues.addNonSchemaIssue("JSON_KEY_REQUIRED", [
          {
            ...context.file,
            evidence: `missing ${keyName} as per ${schemaPath}`,
          },
        ]);
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
    recommended: "ignore",
    required: "error",
    optional: "ignore",
    prohibited: "ignore",
  };
  let severity: Severity = "ignore";

  if (typeof requirement === "string" && requirement in levelToSeverity) {
    severity = levelToSeverity[requirement];
  } else if (typeof requirement === "object" && requirement.level) {
    severity = levelToSeverity[requirement.level];
    const addendumRegex = /(required|recommended) if \`(\w+)\` is \`(\w+)\`/;
    if (requirement.level_addendum) {
      const match = addendumRegex.exec(requirement.level_addendum);
      if (match && match.length === 4) {
        const [_, addendumLevel, key, value] = match;
        if (key in context.sidecar && context.sidecar[key] === value) {
          severity = levelToSeverity[addendumLevel];
        }
      }
    }
  }
  return severity;
}
