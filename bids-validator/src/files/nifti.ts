import 'https://raw.githubusercontent.com/rii-mango/NIFTI-Reader-JS/v0.6.4/release/current/nifti-reader-min.js'
import { BIDSFile } from '../types/file.ts'
import { logger } from '../utils/logger.ts'

export async function loadHeader(file: BIDSFile) {
  try {
    const buf = await file.readBytes(1024)
    // @ts-expect-error NIFTI-Reader-JS required mangling globals
    const header = globalThis.nifti.readHeader(buf.buffer)
    // normalize between nifti-reader and spec schema
    // https://github.com/bids-standard/bids-specification/blob/master/src/schema/meta/context.yaml#L200
    if (header) {
      header.pixdim = header.pixDims
      header.dim = header.dims
    }
    return header
  } catch (err) {
    logger.warning(`NIfTI file could not be opened or read ${file.path}`)
    logger.debug(err)
    return
  }
}
