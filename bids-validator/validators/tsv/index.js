/* eslint-disable no-unused-vars */
import TSV from './tsv'

import checkPhenotype from './checkPhenotype'
import validateTsvColumns from './validateTsvColumns'
import validate from './validate'
import checkAge89 from './checkAge89'
import checkAcqTimeFormat from './checkAcqTimeFormat'
import validateContRec from './validateContRecordings'

export default {
  TSV: TSV,
  checkPhenotype: checkPhenotype,
  validateTsvColumns: validateTsvColumns,
  validate: validate,
  checkAge89: checkAge89,
  checkAcqTimeFormat: checkAcqTimeFormat,
  validateContRec: validateContRec,
}
