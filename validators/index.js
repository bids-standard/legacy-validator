// dependencies ------------------------------------------------------
require('cross-fetch/polyfill')
const tsv = require('./tsv')
const JSON = require('./json').json
const NIFTI = require('./nifti').nifti
const BIDS = require('./bids').start
const Events = require('./events')
const bval = require('./bval').bval
const bvec = require('./bvec').bvec
const utils = require('../utils')

// public api --------------------------------------------------------

const validate = {
  BIDS: BIDS,
  JSON: JSON,
  TSV: tsv,
  NIFTI: NIFTI,
  Events: Events,
  bval: bval,
  bvec: bvec,
  reformat: utils.issues.reformat,
  utils: utils,
}

// exports -----------------------------------------------------------

module.exports = validate
