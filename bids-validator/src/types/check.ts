import { GenericSchema } from './schema.ts'
import { BIDSContext } from '../schema/context.ts'

/** Function interface for writing a check */
export type CheckFunction = (
  schema: GenericSchema,
  context: BIDSContext,
) => Promise<void>
