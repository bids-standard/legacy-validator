import { Schema } from '../types/schema.ts'
import { objectPathHandler } from '../utils/objectPathHandler.ts'
import * as schemaDefault from 'https://bids-specification.readthedocs.io/en/latest/schema.json' assert { type: 'json' }

/**
 * Load the schema from the specification
 *
 * version is ignored when the network cannot be accessed
 */
export async function loadSchema(version = 'latest'): Promise<Schema> {
  const versionRegex = /^v\d/
  let schemaUrl = version
  const bidsSchema = Deno.env.get('BIDS_SCHEMA')
  if (bidsSchema !== undefined) {
    schemaUrl = bidsSchema
  } else if (version === 'latest' || versionRegex.test(version)) {
    schemaUrl = `https://bids-specification.readthedocs.io/en/${version}/schema.json`
  }
  try {
    const schemaModule = await import(schemaUrl, {
      assert: { type: 'json' },
    })
    return new Proxy(
      schemaModule.default as object,
      objectPathHandler,
    ) as Schema
  } catch (error) {
    // No network access or other errors
    console.error(error)
    console.error(
      `Warning, could not load schema from ${schemaUrl}, falling back to internal version`,
    )
    return new Proxy(
      schemaDefault.default as object,
      objectPathHandler,
    ) as Schema
  }
}
