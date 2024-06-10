import { IssueDefinitionRecord } from "../types/issues.ts";

export const filenameIssues: IssueDefinitionRecord = {
  MISSING_DATASET_DESCRIPTION: {
    severity: 'error',
    reason:
      'A dataset_description.json file is required in the root of the dataset',
  },
  INVALID_ENTITY_LABEL: {
    severity: "error",
    reason:
      "entity label doesn't match format found for files with this suffix",
  },
  ENTITY_WITH_NO_LABEL: {
    severity: "error",
    reason: "Found an entity with no label.",
  },
  MISSING_REQUIRED_ENTITY: {
    severity: "error",
    reason: "Missing required entity for files with this suffix.",
  },
  ENTITY_NOT_IN_RULE: {
    severity: "error",
    reason:
      "Entity not listed as required or optional for files with this suffix",
  },
  DATATYPE_MISMATCH: {
    severity: "error",
    reason:
      "The datatype directory does not match datatype of found suffix and extension",
  },
  ALL_FILENAME_RULES_HAVE_ISSUES: {
    severity: "error",
    reason:
      "Multiple filename rules were found as potential matches. All of them had at least one issue during filename validation.",
  },
  EXTENSION_MISMATCH: {
    severity: "error",
    reason:
      "Extension used by file does not match allowed extensions for its suffix",
  },
  JSON_KEY_REQUIRED: {
    severity: "error",
    reason: "A data file's JSON sidecar is missing a key listed as required.",
  },
  JSON_KEY_RECOMMENDED: {
    severity: "warning",
    reason: "A data files JSON sidecar is missing a key listed as recommended.",
  },
  TSV_ERROR: {
    severity: "error",
    reason: "generic place holder for errors from tsv files",
  },
  TSV_COLUMN_MISSING: {
    severity: "error",
    reason: "A required column is missing",
  },
  TSV_COLUMN_ORDER_INCORRECT: {
    severity: "error",
    reason: "Some TSV columns are in the incorrect order",
  },
  TSV_ADDITIONAL_COLUMNS_NOT_ALLOWED: {
    severity: "error",
    reason:
      "A TSV file has extra columns which are not allowed for its file type",
  },
  TSV_INDEX_VALUE_NOT_UNIQUE: {
    severity: "error",
    reason:
      "An index column(s) was specified for the tsv file and not all of the values for it are unique.",
  },
  TSV_VALUE_INCORRECT_TYPE: {
    severity: "error",
    reason:
      "A value in a column did match the acceptable type for that column headers specified format.",
  },
  TSV_VALUE_INCORRECT_TYPE_NONREQUIRED: {
    severity: "warning",
    reason:
      "A value in a column did match the acceptable type for that column headers specified format.",
  },
  TSV_COLUMN_TYPE_REDEFINED: {
    severity: "warning",
    reason:
      "A column required in a TSV file has been redefined in a sidecar file. This redefinition is being ignored.",
  },
  CHECK_ERROR: {
    severity: "error",
    reason:
      "generic place holder for errors from failed `checks` evaluated from schema.",
  },
  NOT_INCLUDED: {
    severity: "error",
    reason:
      "Files with such naming scheme are not part of BIDS specification. This error is most commonly " +
      "caused by typos in file names that make them not BIDS compatible. Please consult the specification and " +
      "make sure your files are named correctly. If this is not a file naming issue (for example when including " +
      'files not yet covered by the BIDS specification) you should include a ".bidsignore" file in your dataset (see' +
      " https://github.com/bids-standard/bids-validator#bidsignore for details). Please " +
      "note that derived (processed) data should be placed in /derivatives folder and source data (such as DICOMS " +
      "or behavioural logs in proprietary formats) should be placed in the /sourcedata folder.",
  },
  EMPTY_FILE: {
    severity: "error",
    reason: "Empty files not allowed.",
  },
};

export const nonSchemaIssues = { ...filenameIssues };
