import { Schema } from '../types/schema.ts'

export function lookupModality(schema: Schema, datatype: string): string {
  const modalities = schema.rules.modalities as Record<string, any>
  const datatypes = Object.keys(modalities).filter((key: string) => {
    modalities[key].datatypes.includes(datatype)
  })
  if (datatypes.length === 1) {
    return datatypes[0]
  } else if (datatypes.length === 0) {
    return ''
  } else {
    // what if multiple modalites are found?
    return ''
  }
}
