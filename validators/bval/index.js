const validate = require('./validate')
const bval = require('./bval')
const helpers = require('./helpers')

/**
 * bval
 *
 * Takes a bval file, its contents as a string
 * and a callback as arguments. Callsback
 * with any issues it finds while validating
 * against the BIDS specification.
 */
module.exports = {
  validate: validate,
  bval: bval,
  helpers: helpers,
}
