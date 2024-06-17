import { CheckFunction } from '../types/check.ts'
import { FileTree } from '../types/filetree.ts'
import { IssueFile } from '../types/issues.ts'
import { GenericSchema } from '../types/schema.ts'
import { ValidationResult } from '../types/validation-result.ts'
import { applyRules } from '../schema/applyRules.ts'
import { walkFileTree } from '../schema/walk.ts'
import { loadSchema } from '../setup/loadSchema.ts'
import { ValidatorOptions } from '../setup/options.ts'
import { Summary } from '../summary/summary.ts'
import { filenameIdentify } from './filenameIdentify.ts'
import { filenameValidate } from './filenameValidate.ts'
import { DatasetIssues } from '../issues/datasetIssues.ts'
import { emptyFile } from './internal/emptyFile.ts'
import { BIDSContext, BIDSContextDataset } from '../schema/context.ts'
import { BIDSFile } from '../types/file.ts'
import { parseOptions } from '../setup/options.ts'

/**
 * Ordering of checks to apply
 */
const CHECKS: CheckFunction[] = [
  emptyFile,
  filenameIdentify,
  filenameValidate,
  applyRules,
];

/**
 * Full BIDS schema validation entrypoint
 */
export async function validate(
  fileTree: FileTree,
  options: ValidatorOptions,
): Promise<ValidationResult> {
  const issues = new DatasetIssues();
  const summary = new Summary();
  const schema = await loadSchema(options.schema);
  summary.schemaVersion = schema.schema_version;

  /* There should be a dataset_description in root, this will tell us if we
   * are dealing with a derivative dataset
   */
  const ddFile = fileTree.files.find(
    (file: BIDSFile) => file.name === "dataset_description.json",
  );

  let dsContext;
  if (ddFile) {
    const description = await ddFile.text().then((text) => JSON.parse(text));
    summary.dataProcessed = description.DatasetType === "derivative";
    dsContext = new BIDSContextDataset(options, description);
  } else {
    dsContext = new BIDSContextDataset(options);
    issues.addNonSchemaIssue('MISSING_DATASET_DESCRIPTION', [] as IssueFile[]);
  }

  let derivatives: FileTree[] = [];
  fileTree.directories = fileTree.directories.filter((dir) => {
    if (dir.name === "derivatives") {
      dir.directories.map((deriv) => {
        if (
          deriv.files.some(
            (file: BIDSFile) => file.name === "dataset_description.json",
          )
        ) {
          derivatives.push(deriv);
        }
      });
      return true;
    }
    return true;
  });

  for await (const context of walkFileTree(fileTree, issues, dsContext)) {
    // TODO - Skip ignored files for now (some tests may reference ignored files)
    if (context.file.ignored) {
      continue;
    }
    if (
      dsContext.dataset_description.DatasetType == "raw" &&
      context.file.path.includes("derivatives")
    ) {
      continue;
    }
    await context.asyncLoads();
    // Run majority of checks
    for (const check of CHECKS) {
      await check(schema as unknown as GenericSchema, context);
    }
    await summary.update(context);
  }

  let derivativesSummary: Record<string, ValidationResult> = {};
  await Promise.allSettled(
    derivatives.map(async (deriv) => {
      derivativesSummary[deriv.name] = await validate(deriv, options);
      return derivativesSummary[deriv.name];
    }),
  );

  let output: ValidationResult = {
    issues,
    summary: summary.formatOutput(),
  };

  if (Object.keys(derivativesSummary).length) {
    output["derivativesSummary"] = derivativesSummary;
  }
  return output;
}
