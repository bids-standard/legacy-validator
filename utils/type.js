/**
 * Type
 *
 * A library of functions that take a file path and return a boolean
 * representing whether the given file path is valid within the
 * BIDS specification requirements.
 */

/**
 * Import RegExps from bids-validator-common
 */
const associated_data_rules = require('../bids_validator/rules/associated_data_rules.json')
const file_level_rules = require('../bids_validator/rules/file_level_rules.json')
const fixed_top_level_names = require('../bids_validator/rules/fixed_top_level_names.json')
const phenotypic_rules = require('../bids_validator/rules/phenotypic_rules.json')
const session_level_rules = require('../bids_validator/rules/session_level_rules.json')
const subject_level_rules = require('../bids_validator/rules/subject_level_rules.json')
const top_level_rules = require('../bids_validator/rules/top_level_rules.json')

// Associated data
const associatedData = buildRegExp(associated_data_rules.associated_data)
// File level
const anatData = buildRegExp(file_level_rules.anat)
const anatDefacemaskData = buildRegExp(file_level_rules.anat_defacemask)
const behavioralData = buildRegExp(file_level_rules.behavioral)
const contData = buildRegExp(file_level_rules.cont)
const dwiData = buildRegExp(file_level_rules.dwi)
const eegData = buildRegExp(file_level_rules.eeg)
const fieldmapData = buildRegExp(file_level_rules.field_map)
const fieldmapMainNiiData = buildRegExp(file_level_rules.field_map_main_nii)
const funcData = buildRegExp(file_level_rules.func)
const funcBoldData = buildRegExp(file_level_rules.func_bold)
const ieegData = buildRegExp(file_level_rules.ieeg)
const megData = buildRegExp(file_level_rules.meg)
const stimuliData = buildRegExp(file_level_rules.stimuli)
// Phenotypic data
const phenotypicData = buildRegExp(phenotypic_rules.phenotypic_data)
// Session level
const anatSes = buildRegExp(session_level_rules.anat_ses)
const dwiSes = buildRegExp(session_level_rules.dwi_ses)
const eegSes = buildRegExp(session_level_rules.eeg_ses)
const funcSes = buildRegExp(session_level_rules.func_ses)
const ieegSes = buildRegExp(session_level_rules.ieeg_ses)
const megSes = buildRegExp(session_level_rules.meg_ses)
const scansSes = buildRegExp(session_level_rules.scans)
// Subject level
const subjectLevel = buildRegExp(subject_level_rules.subject_level)
// Top level
const fixedTopLevelNames = fixed_top_level_names.fixed_top_level_names
const funcTop = buildRegExp(top_level_rules.func_top)
const anatTop = buildRegExp(top_level_rules.anat_top)
const dwiTop = buildRegExp(top_level_rules.dwi_top)
const eegTop = buildRegExp(top_level_rules.eeg_top)
const ieegTop = buildRegExp(top_level_rules.ieeg_top)
const multiDirFieldmap = buildRegExp(top_level_rules.multi_dir_fieldmap)
const otherTopFiles = buildRegExp(top_level_rules.other_top_files)
const megTop = buildRegExp(top_level_rules.meg_top)

module.exports = {
  /**
   * Is BIDS
   *
   * Check if a given path is valid within the
   * bids spec.
   */
  isBIDS: function(path, bep006, bep010) {
    return (
      this.file.isTopLevel(path) ||
      this.file.isStimuliData(path) ||
      this.file.isSessionLevel(path) ||
      this.file.isSubjectLevel(path) ||
      this.file.isAnat(path) ||
      this.file.isDWI(path) ||
      this.file.isFunc(path) ||
      this.file.isMeg(path) ||
      (this.file.isIEEG(path) && bep010) ||
      (this.file.isEEG(path) && bep006) ||
      this.file.isBehavioral(path) ||
      this.file.isCont(path) ||
      this.file.isFieldMap(path) ||
      this.file.isPhenotypic(path)
    )
  },

  /**
   * Object with all file type checks
   */
  file: {
    /**
     * Check if the file has appropriate name for a top level file
     */
    isTopLevel: function(path) {
      return (
        fixedTopLevelNames.indexOf(path) != -1 ||
        funcTop.test(path) ||
        dwiTop.test(path) ||
        anatTop.test(path) ||
        multiDirFieldmap.test(path) ||
        otherTopFiles.test(path) ||
        megTop.test(path) ||
        eegTop.test(path) ||
        ieegTop.test(path)
      )
    },

    /**
     * Check if file is a data file
     */
    isDatafile: function(path) {
      return (
        this.isAssociatedData(path) ||
        this.isTSV(path) ||
        this.isStimuliData(path) ||
        this.isPhenotypic(path) ||
        this.isModality(path) ||
        this.isAnat(path) ||
        this.isDWI(path) ||
        this.isFieldMap(path) ||
        this.isFieldMapMainNii(path) ||
        this.isFunc(path) ||
        this.isMeg(path) ||
        this.isEEG(path) ||
        this.isIEEG(path) ||
        this.isBehavioral(path) ||
        this.isFuncBold(path) ||
        this.isCont(path)
      )
    },
    /**
     * Check if file is appropriate associated data.
     */
    isAssociatedData: function(path) {
      return associatedData.test(path)
    },

    isTSV: function(path) {
      return path.endsWith('.tsv')
    },

    isStimuliData: function(path) {
      return stimuliData.test(path)
    },

    /**
     * Check if file is phenotypic data.
     */
    isPhenotypic: function(path) {
      return phenotypicData.test(path)
    },
    /**
     * Check if the file has appropriate name for a session level
     */
    isSessionLevel: function(path) {
      return (
        conditionalMatch(scansSes, path) ||
        conditionalMatch(funcSes, path) ||
        conditionalMatch(anatSes, path) ||
        conditionalMatch(dwiSes, path) ||
        conditionalMatch(megSes, path) ||
        conditionalMatch(eegSes, path) ||
        conditionalMatch(ieegSes, path)
      )
    },

    /**
     * Check if the file has appropriate name for a subject level
     */
    isSubjectLevel: function(path) {
      return subjectLevel.test(path)
    },

    /**
     * Check if the file has a name appropriate for an anatomical scan
     */
    isAnat: function(path) {
      return (
        conditionalMatch(anatData, path) ||
        conditionalMatch(anatDefacemaskData, path)
      )
    },

    /**
     * Check if the file has a name appropriate for a diffusion scan
     */
    isDWI: function(path) {
      return conditionalMatch(dwiData, path)
    },

    /**
     * Check if the file has a name appropriate for a fieldmap scan
     */
    isFieldMap: function(path) {
      return conditionalMatch(fieldmapData, path)
    },

    isFieldMapMainNii: function(path) {
      return conditionalMatch(fieldmapMainNiiData, path)
    },

    /**
     * Check if the file has a name appropriate for a functional scan
     */
    isFunc: function(path) {
      return conditionalMatch(funcData, path)
    },

    isMeg: function(path) {
      return conditionalMatch(megData, path)
    },

    isEEG: function(path) {
      return conditionalMatch(eegData, path)
    },

    isIEEG: function(path) {
      return conditionalMatch(ieegData, path)
    },

    isBehavioral: function(path) {
      return conditionalMatch(behavioralData, path)
    },

    isFuncBold: function(path) {
      return conditionalMatch(funcBoldData, path)
    },

    isCont: function(path) {
      return conditionalMatch(contData, path)
    },
  },

  checkType(obj, typeString) {
    if (typeString == 'number') {
      return !isNaN(parseFloat(obj)) && isFinite(obj)
    } else {
      return typeof obj == typeString
    }
  },

  /**
   * Get Path Values
   *
   * Takes a file path and returns and values
   * found for the following path keys.
   * sub-
   * ses-
   */
  getPathValues: function(path) {
    var values = {},
      match

    // capture subject
    match = /^\/sub-([a-zA-Z0-9]+)/.exec(path)
    values.sub = match && match[1] ? match[1] : null

    // capture session
    match = /^\/sub-[a-zA-Z0-9]+\/ses-([a-zA-Z0-9]+)/.exec(path)
    values.ses = match && match[1] ? match[1] : null

    return values
  },
}

function conditionalMatch(expression, path) {
  var match = expression.exec(path)

  // we need to do this because JS does not support conditional groups
  if (match) {
    if ((match[2] && match[3]) || !match[2]) {
      return true
    }
  }
  return false
}

/**
 * Insert tokens into RegExps from bids-validator-common
 */
function buildRegExp(obj) {
  if (obj.tokens) {
    let regExp = obj.regexp
    const keys = Object.keys(obj.tokens)
    for (let key of keys) {
      const args = obj.tokens[key].join('|')
      regExp = regExp.replace(key, args)
    }
    return new RegExp(regExp)
  } else {
    return new RegExp(obj.regexp)
  }
}
