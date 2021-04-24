// dependencies ------------------------------------------------------
import 'cross-fetch/polyfill'

import tsv from '../validators/tsv'
import json from '../validators/json'
import { NIFTI } from '../validators/nifti'
import start from './start'
import Events from '../validators/events'
import { bval } from '../validators/bval'
import { bvec } from '../validators/bvec'
import utils from '../utils'
import consoleFormat from '../utils/consoleFormat'

// public api --------------------------------------------------------

const validate = {
  BIDS: start,
  JSON: json.json,
  TSV: tsv,
  NIFTI,
  Events: Events,
  bval: bval,
  bvec: bvec,
  reformat: utils.issues.reformat,
  utils: utils,
  consoleFormat,
}

// export validations for use in other applications
export default validate
