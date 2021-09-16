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
import associated_data_rules from '../bids_validator/rules/associated_data_rules.json'

import file_level_rules from '../bids_validator/rules/file_level_rules.json'
import phenotypic_rules from '../bids_validator/rules/phenotypic_rules.json'
import session_level_rules from '../bids_validator/rules/session_level_rules.json'
import subject_level_rules from '../bids_validator/rules/subject_level_rules.json'
import top_level_rules from '../bids_validator/rules/top_level_rules.json'

let bids_schema

// Alternative method of loading from bids-specification schema
export function schemaSetup(schema) {
  bids_schema = schema
}

// Associated data
const associatedData = buildRegExp(associated_data_rules.associated_data)
// File level
const anatNonparametric = buildRegExp(file_level_rules.anat_nonparametric)
const anatParametric = buildRegExp(file_level_rules.anat_parametric)
const anatDefacemask = buildRegExp(file_level_rules.anat_defacemask)
const anatMultiEcho = buildRegExp(file_level_rules.anat_multiecho)
const anatMultiFlip = buildRegExp(file_level_rules.anat_multiflip)
const anatMultiInv = buildRegExp(file_level_rules.anat_multiinv)
const anatMP2RAGE = buildRegExp(file_level_rules.anat_mp2rage)
const anatVFAMT = buildRegExp(file_level_rules.anat_vfa_mt)
const anatMTR = buildRegExp(file_level_rules.anat_mtr)
const behavioralData = buildRegExp(file_level_rules.behavioral)
const dwiData = buildRegExp(file_level_rules.dwi)
const eegData = buildRegExp(file_level_rules.eeg)
const fmapGre = buildRegExp(file_level_rules.fmap_gre)
const fmapPepolarAsl = buildRegExp(file_level_rules.fmap_pepolar_asl)
const fmapTB1DAM = buildRegExp(file_level_rules.fmap_TB1DAM)
const fmapTB1EPI = buildRegExp(file_level_rules.fmap_TB1EPI)
const fmapRF = buildRegExp(file_level_rules.fmap_rf)
const fmapTB1SRGE = buildRegExp(file_level_rules.fmap_TB1SRGE)
const fmapParametric = buildRegExp(file_level_rules.fmap_parametric)
const func = buildRegExp(file_level_rules.func)
const funcPhaseDeprecated = buildRegExp(file_level_rules.func_phase_deprecated)
const funcEvents = buildRegExp(file_level_rules.func_events)
const funcTimeseries = buildRegExp(file_level_rules.func_timeseries)
const funcBoldData = buildRegExp(file_level_rules.func_bold)
const aslData = buildRegExp(file_level_rules.asl)
const ieegData = buildRegExp(file_level_rules.ieeg)
const megData = buildRegExp(file_level_rules.meg)
const megCalibrationData = buildRegExp(file_level_rules.meg_calbibration)
const megCrosstalkData = buildRegExp(file_level_rules.meg_crosstalk)
const stimuliData = buildRegExp(file_level_rules.stimuli)
const petData = buildRegExp(file_level_rules.pet)
const petBlood = buildRegExp(file_level_rules.pet_blood)
const microscopyData = buildRegExp(file_level_rules.microscopy)
const microscopyJSON = buildRegExp(file_level_rules.microscopy_json)
// Phenotypic data
const phenotypicData = buildRegExp(phenotypic_rules.phenotypic_data)
// Session level
const anatSes = buildRegExp(session_level_rules.anat_ses)
const dwiSes = buildRegExp(session_level_rules.dwi_ses)
const eegSes = buildRegExp(session_level_rules.eeg_ses)
const funcSes = buildRegExp(session_level_rules.func_ses)
const aslSes = buildRegExp(session_level_rules.asl_ses)
const ieegSes = buildRegExp(session_level_rules.ieeg_ses)
const megSes = buildRegExp(session_level_rules.meg_ses)
const scansSes = buildRegExp(session_level_rules.scans)
const petSes = buildRegExp(session_level_rules.pet_ses)
const microscopySes = buildRegExp(session_level_rules.microscopy_ses)
// Subject level
const subjectLevel = buildRegExp(subject_level_rules.subject_level)
// Top level
const rootTop = buildRegExp(top_level_rules.root_top)
const funcTop = buildRegExp(top_level_rules.func_top)
const aslTop = buildRegExp(top_level_rules.asl_top)
const anatTop = buildRegExp(top_level_rules.anat_top)
const dwiTop = buildRegExp(top_level_rules.dwi_top)
const eegTop = buildRegExp(top_level_rules.eeg_top)
const ieegTop = buildRegExp(top_level_rules.ieeg_top)
const multiDirFieldmap = buildRegExp(top_level_rules.multi_dir_fieldmap)
const otherTopFiles = buildRegExp(top_level_rules.other_top_files)
const megTop = buildRegExp(top_level_rules.meg_top)
const petTop = buildRegExp(top_level_rules.pet_top)
const microscopyTop = buildRegExp(top_level_rules.microscopy_top)

export default {
  /**
   * Is BIDS
   *
   * Check if a given path is valid within the
   * bids spec.
   */
  isBIDS: function(path) {
    return (
      this.file.isTopLevel(path) ||
      this.file.isStimuliData(path) ||
      this.file.isSessionLevel(path) ||
      this.file.isSubjectLevel(path) ||
      this.file.isAnat(path) ||
      this.file.isDWI(path) ||
      this.file.isFunc(path) ||
      this.file.isAsl(path) ||
      this.file.isMeg(path) ||
      this.file.isIEEG(path) ||
      this.file.isEEG(path) ||
      this.file.isBehavioral(path) ||
      this.file.isFieldMap(path) ||
      this.file.isPhenotypic(path) ||
      this.file.isPET(path) ||
      this.file.isPETBlood(path) ||
      this.file.isMicroscopy(path) ||
      this.file.isMicroscopyJSON(path)
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
      if (bids_schema) {
        return (
          bids_schema.top_level_files.some(regex => regex.exec(path)) ||
          funcTop.test(path) ||
          aslTop.test(path) ||
          dwiTop.test(path) ||
          anatTop.test(path) ||
          multiDirFieldmap.test(path) ||
          otherTopFiles.test(path) ||
          megTop.test(path) ||
          eegTop.test(path) ||
          ieegTop.test(path) ||
          petTop.test(path) ||
          microscopyTop.test(path)
        )
      } else {
        return (
          rootTop.test(path) ||
          funcTop.test(path) ||
          aslTop.test(path) ||
          dwiTop.test(path) ||
          anatTop.test(path) ||
          multiDirFieldmap.test(path) ||
          otherTopFiles.test(path) ||
          megTop.test(path) ||
          eegTop.test(path) ||
          ieegTop.test(path) ||
          petTop.test(path) ||
          microscopyTop.test(path)
        )
      }
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
        this.hasModality(path)
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

    isContinousRecording: function(path) {
      return path.endsWith('.tsv.gz')
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
        conditionalMatch(aslSes, path) ||
        conditionalMatch(anatSes, path) ||
        conditionalMatch(dwiSes, path) ||
        conditionalMatch(megSes, path) ||
        conditionalMatch(eegSes, path) ||
        conditionalMatch(ieegSes, path) ||
        conditionalMatch(petSes, path) ||
        conditionalMatch(microscopySes, path)
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
      if (bids_schema) {
        return bids_schema.datatypes['anat'].some(regex => regex.exec(path))
      } else {
        return (
          conditionalMatch(anatNonparametric, path) ||
          conditionalMatch(anatParametric, path) ||
          conditionalMatch(anatDefacemask, path) ||
          conditionalMatch(anatMultiEcho, path) ||
          conditionalMatch(anatMultiFlip, path) ||
          conditionalMatch(anatMultiInv, path) ||
          conditionalMatch(anatMP2RAGE, path) ||
          conditionalMatch(anatVFAMT, path) ||
          conditionalMatch(anatMTR, path)
        )
      }
    },

    /**
     * Check if the file has a name appropriate for a diffusion scan
     */
    isDWI: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['dwi'].some(regex => regex.exec(path))
      } else {
        return conditionalMatch(dwiData, path)
      }
    },

    /**
     * Check if the file has a name appropriate for a fieldmap scan
     */
    isFieldMap: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['fmap'].some(regex => regex.exec(path))
      } else {
        return (
          conditionalMatch(fmapGre, path) ||
          conditionalMatch(fmapPepolarAsl, path) ||
          conditionalMatch(fmapTB1DAM, path) ||
          conditionalMatch(fmapTB1EPI, path) ||
          conditionalMatch(fmapTB1SRGE, path) ||
          conditionalMatch(fmapRF, path) ||
          conditionalMatch(fmapParametric, path)
        )
      }
    },

    isFieldMapMainNii: function(path) {
      return (
        !path.endsWith('.json') &&
        /* isFieldMap */
        (conditionalMatch(fmapGre, path) ||
          conditionalMatch(fmapPepolarAsl, path) ||
          conditionalMatch(fmapTB1DAM, path) ||
          conditionalMatch(fmapTB1EPI, path) ||
          conditionalMatch(fmapTB1SRGE, path) ||
          conditionalMatch(fmapRF, path) ||
          conditionalMatch(fmapParametric, path))
      )
    },

    /**
     * Check if the file has a name appropriate for a functional scan
     */
    isFunc: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['func'].some(regex => regex.exec(path))
      } else {
        return (
          conditionalMatch(func, path) ||
          conditionalMatch(funcPhaseDeprecated, path) ||
          conditionalMatch(funcEvents, path) ||
          conditionalMatch(funcTimeseries, path)
        )
      }
    },

    isAsl: function(path) {
      return conditionalMatch(aslData, path)
    },

    isPET: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['pet'].some(regex => regex.exec(path))
      } else {
        return conditionalMatch(petData, path)
      }
    },

    isPETBlood: function(path) {
      return conditionalMatch(petBlood, path)
    },

    isMeg: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['meg'].some(regex => regex.exec(path))
      } else {
        return (
          conditionalMatch(megData, path) ||
          conditionalMatch(megCalibrationData, path) ||
          conditionalMatch(megCrosstalkData, path)
        )
      }
    },

    isEEG: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['eeg'].some(regex => regex.exec(path))
      } else {
        return conditionalMatch(eegData, path)
      }
    },

    isIEEG: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['ieeg'].some(regex => regex.exec(path))
      } else {
        return conditionalMatch(ieegData, path)
      }
    },

    isMicroscopy: function(path) {
      return conditionalMatch(microscopyData, path)
    },

    isMicroscopyJSON: function(path) {
      return conditionalMatch(microscopyJSON, path)
    },

    isBehavioral: function(path) {
      if (bids_schema) {
        return bids_schema.datatypes['beh'].some(regex => regex.exec(path))
      } else {
        return conditionalMatch(behavioralData, path)
      }
    },

    isFuncBold: function(path) {
      return conditionalMatch(funcBoldData, path)
    },

    hasModality: function(path) {
      return (
        this.isAnat(path) ||
        this.isDWI(path) ||
        this.isFieldMap(path) ||
        this.isFieldMapMainNii(path) ||
        this.isFunc(path) ||
        this.isAsl(path) ||
        this.isMeg(path) ||
        this.isEEG(path) ||
        this.isIEEG(path) ||
        this.isBehavioral(path) ||
        this.isFuncBold(path) ||
        this.isPET(path) ||
        this.isPETBlood(path) ||
        this.isMicroscopy(path) ||
        this.isMicroscopyJSON(path)
      )
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

  // CommonJS default export
  schemaSetup,
}

function conditionalMatch(expression, path) {
  const match = expression.exec(path)

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
