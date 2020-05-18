// An index of rules documents to export as modules
// The Python module expects these to be within its tree, but we can just import them from there
import associated_data_rules from '../bids_validator/bids_validator/rules/associated_data_rules.json'

import file_level_rules from '../bids_validator/bids_validator/rules/file_level_rules.json'
import fixed_top_level_names from '../bids_validator/bids_validator/rules/fixed_top_level_names.json'
import phenotypic_rules from '../bids_validator/bids_validator/rules/phenotypic_rules.json'
import session_level_rules from '../bids_validator/bids_validator/rules/session_level_rules.json'
import subject_level_rules from '../bids_validator/bids_validator/rules/subject_level_rules.json'
import top_level_rules from '../bids_validator/bids_validator/rules/top_level_rules.json'

export default {
  associated_data_rules: associated_data_rules,
  file_level_rules: file_level_rules,
  fixed_top_level_names: fixed_top_level_names,
  phenotypic_rules: phenotypic_rules,
  session_level_rules: session_level_rules,
  subject_level_rules: subject_level_rules,
  top_level_rules: top_level_rules,
}
