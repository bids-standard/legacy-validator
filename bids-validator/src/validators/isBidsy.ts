/**
 * Not sure if we want this yet. Would be to create issues for non standard
 * derivatives to have the lowest common denomenator of bids like file names.
 */
// @ts-nocheck
import { BIDSContext } from '../schema/context.ts'
import { CheckFunction } from '../../types/check.ts'
import { BIDSFile } from '../types/file.ts'
import { Schema } from '../types/schema.ts'

export const isBidsyFilename: CheckFunction = (schema, context) => {
  // every '.', '-', '_' followed by an alnum
  // only contains '.', '-', '_' and alnum
}
