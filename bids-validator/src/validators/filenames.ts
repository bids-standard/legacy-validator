// @ts-nocheck
import { SEP } from '../deps/path.ts'
import { Schema } from '../types/schema.ts'
import { BIDSContext } from '../schema/context.ts'
import { lookupModality } from '../schema/modalities.ts'

// This should be defined in the schema
const sidecarExtensions = ['.json', '.tsv', '.bvec', '.bval']

export function checkDatatypes(schema: Schema, context: BIDSContext) {
  delete schema.rules.datatypes.derivatives
  let matchedRule
  datatypeFromDirectory(schema, context)
  if (schema.rules.datatypes.hasOwnProperty(context.datatype)) {
    const rules = schema.rules.datatypes[context.datatype]

    for (const key of Object.keys(rules)) {
      if (validateFilenameAgainstRule(rules[key], schema, context)) {
        matchedRule = key
        break
      }
    }
  }
  /* If we can't find a datatype in the directory names, and match a rule
   * for that datatype we might want to see if there are any rules for any
   * datatype that we may be able to match against. Certain suffixes are
   * used across datatypes so its conceivable we could have multiple possible
   * matches. Sidecars at root of dataset also fall into this category.
   */
  if (matchedRule === undefined) {
    const possibleDatatypes = new Set()
    const datatypes = Object.values(schema.rules.datatypes)
    for (const rules of datatypes) {
      for (const key of Object.keys(rules)) {
        if (validateFilenameAgainstRule(rules[key], schema, context)) {
          matchedRule = key
          possibleDatatypes.add(rules[key].datatypes)
          break
        }
      }
    }
    /**
     * If nothing matches, this is an unrecognizable filename and should throw the general error
     *
     * Special case for .bidsignore which is not defined by the specification schema
     */
    if (matchedRule === undefined && context.file.path !== '/.bidsignore') {
      context.issues.addNonSchemaIssue('NOT_INCLUDED', [context.file])
    }
  }
}

/* Returns false if the rule doesn't match the suffix or extension.
 * Returns true otherwise, generating issues as applicable
 */
export function validateFilenameAgainstRule(
  rule,
  schema: Schema,
  context: BIDSContext,
): boolean {
  const { suffix, extension, entities } = context
  const fileIsAtRoot = isAtRoot(context)
  const fileIsSidecar = sidecarExtensions.includes(extension)

  if (rule.suffixes && !rule.suffixes.includes(suffix)) {
    return false
  }

  if (rule.extensions && !rule.extensions.includes(extension)) {
    return false
  }

  if (
    !!context.datatype &&
    rule.datatypes &&
    !rule.datatypes.includes(context.datatype)
  ) {
    context.issues.addNonSchemaIssue('DATATYPE_MISMATCH', [
      { ...context.file, evidence: `Datatype rule being applied: ${rule}` },
    ])
  }

  // context entities are key-value pairs from filename.
  const fileNoLabelEntities = Object.keys(entities).filter(
    (key) => entities[key] === 'NOENTITY',
  )
  const fileEntities = Object.keys(entities).filter(
    (key) => !fileNoLabelEntities.includes(key),
  )

  if (fileNoLabelEntities.length) {
    context.issues.addNonSchemaIssue('ENTITY_WITH_NO_LABEL', [
      { ...context.file, evidence: fileNoLabelEntities.join(', ') },
    ])
  }

  // we need to convert schema centric name to what shows up in filenames
  const ruleEntities = Object.keys(rule.entities).map((key) =>
    lookupEntityLiteral(key, schema),
  )

  // skip required entity checks if file is at root.
  // No requirements for inherited sidecars at this level.
  if (!fileIsAtRoot) {
    const ruleEntitiesRequired = Object.entries(rule.entities)
      .filter(([_, v]) => v === 'required')
      .map(([k, _]) => lookupEntityLiteral(k, schema))

    const missingRequired = ruleEntitiesRequired.filter(
      (required) => !fileEntities.includes(required),
    )

    if (missingRequired.length) {
      context.issues.addNonSchemaIssue('MISSING_REQUIRED_ENTITY', [
        { ...context.file, evidence: missingRequired.join(', ') },
      ])
    }
  }

  if (fileIsAtRoot && !fileIsSidecar) {
    // create issue for data file in root of dataset
  }

  const entityNotInRule = fileEntities.filter(
    (fileEntity) => !ruleEntities.includes(fileEntity),
  )

  if (entityNotInRule.length) {
    context.issues.addNonSchemaIssue('ENTITY_NOT_IN_RULE', [
      { ...context.file, evidence: entityNotInRule.join(', ') },
    ])
  }
  return true
}

function lookupEntityLiteral(name: string, schema: Schema) {
  const entityObj = schema.objects.entities[name]
  if (entityObj && entityObj['name']) {
    return entityObj['name']
  } else {
    // if this happens there is an issue with the schema?
    return ''
  }
}

function getEntityByLiteral(fileEntity: string, schema: Schema) {
  const entities = schema.objects.entities
  const key = Object.keys(entities).find((key) => {
    return entities[key].name === fileEntity
  })
  if (key) {
    return entities[key]
  }
  return null
}

export function datatypeFromDirectory(schema: Schema, context: BIDSContext) {
  const subEntity = schema.objects.entities.subject.name
  const subFormat = schema.objects.formats[subEntity.format]
  const sesEntity = schema.objects.entities.session.name
  const sesFormat = schema.objects.formats[sesEntity.format]
  const parts = context.file.path.split(SEP)
  let datatypeIndex = 2
  if (parts[0] !== '') {
    // we assume paths have leading '/'
  }
  // Ignoring associated data for now
  const subParts = parts[1].split('-')
  if (!(subParts.length === 2 && subParts[0] === subEntity)) {
    // first directory must be subject
  }
  if (parts.length < 3) {
    return
  }
  const sesParts = parts[2].split('-')
  if (sesParts.length === 2 && sesParts[0] === sesEntity) {
    datatypeIndex = 3
  }
  let dirDatatype = parts[datatypeIndex]
  for (let key in schema.rules.modalities) {
    if (schema.rules.modalities[key].datatypes.includes(dirDatatype)) {
      context.modality = key
      context.datatype = dirDatatype

      return
    }
  }
}

export function checkLabelFormat(schema: Schema, context: BIDSContext) {
  const formats = schema.objects.formats
  const entities = schema.objects.entities
  Object.keys(context.entities).map((fileEntity) => {
    const entity = getEntityByLiteral(fileEntity, schema)
    if (entity) {
      // assuming all formats are well defined in schema.objects
      const pattern = formats[entity.format].pattern
      const rePattern = new RegExp(`^${pattern}$`)
      const label = context.entities[fileEntity]
      if (!rePattern.test(label)) {
        context.issues.addNonSchemaIssue('INVALID_ENTITY_LABEL', [
          {
            ...context.file,
            evidence: `entity: ${fileEntity} label: ${label} pattern: ${pattern}`,
          },
        ])
      }
    } else {
      // unknown entity
    }
  })
  return
}

export function isAtRoot(context: BIDSContext) {
  if (context.file.path.split(SEP).length !== 2) {
    return false
  }
  return true
}

export function isTopLevel(schema: Schema, context: BIDSContext) {
  if (context.file.path.split(SEP).length !== 2) {
    return false
  }

  const top_level_files = schema.rules.top_level_files
  const name = context.file.name.split('.')[0]
  return top_level_files.hasOwnProperty(name)
}

export function isAssociatedData(schema: Schema, path: string): boolean {
  const associatedData = schema.rules.associated_data
  const parts = path.split(SEP)
  return associatedData.hasOwnProperty(parts[1])
}

/*
export function isTabularMetadata(schema: Schema, context: BIDSContext): boolean {
  const tabularMetadata = schema.rules.tabular_metadata
  return Object.values(tabularMetadata).some(rule => validateFilenameAgainstRule(rule, context))
}
*/
