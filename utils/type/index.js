/**
 * Type
 *
 * A library of functions that take a file path and return a boolean
 * representing whether the given file path is valid within the
 * BIDS specification requirements.
 */
const fixedTopLevelNames = require('./topLevelNames')
const re = require('./typeRegex')

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
      (this.file.isEeg(path) && bep006) ||
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
        re.funcTopRe.test(path) ||
        re.dwiTopRe.test(path) ||
        re.anatTopRe.test(path) ||
        re.multiDirFieldmapRe.test(path) ||
        re.otherTopFiles.test(path) ||
        re.megTopRe.test(path) ||
        re.eegTopRe.test(path) ||
        re.ieegTopRe.test(path)
      )
    },

    /**
     * Check if file is appropriate associated data.
     */
    isAssociatedData: function(path) {
      return re.associatedData.test(path)
    },

    isStimuliData: function(path) {
      return re.stimuliDataRe.test(path)
    },

    /**
     * Check if file is phenotypic data.
     */
    isPhenotypic: function(path) {
      return re.phenotypicData.test(path)
    },

    /**
     * Check if the file has appropriate name for a session level
     */
    isSessionLevel: function(path) {
      return (
        conditionalMatch(re.scansRe, path) ||
        conditionalMatch(re.funcSesRe, path) ||
        conditionalMatch(re.anatSesRe, path) ||
        conditionalMatch(re.dwiSesRe, path) ||
        conditionalMatch(re.megSesRe, path) ||
        conditionalMatch(re.eegSesRe, path) ||
        conditionalMatch(re.ieegSesRe, path)
      )
    },

    /**
     * Check if the file has appropriate name for a subject level
     */
    isSubjectLevel: function(path) {
      return re.sessionsRe.test(path)
    },

    /**
     * Check if the file has a name appropriate for an anatomical scan
     */
    isAnat: function(path) {
      return (
        conditionalMatch(re.anatRe, path) ||
        conditionalMatch(re.anatDefacemaskRe, path)
      )
    },

    /**
     * Check if the file has a name appropriate for a diffusion scan
     */
    isDWI: function(path) {
      var suffixes = ['dwi', 'sbref']
      var anatRe = new RegExp(
        '^\\/(sub-[a-zA-Z0-9]+)' +
          '\\/(?:(ses-[a-zA-Z0-9]+)' +
          '\\/)?dwi' +
          '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?_(?:' +
          suffixes.join('|') +
          ').(nii.gz|nii|json|bvec|bval)$',
      )
      return conditionalMatch(anatRe, path)
    },

    /**
     * Check if the file has a name appropriate for a fieldmap scan
     */
    isFieldMap: function(path) {
      var suffixes = [
        'phasediff',
        'phase1',
        'phase2',
        'magnitude1',
        'magnitude2',
        'magnitude',
        'fieldmap',
        'epi',
      ]
      var anatRe = new RegExp(
        '^\\/(sub-[a-zA-Z0-9]+)' +
          '\\/(?:(ses-[a-zA-Z0-9]+)' +
          '\\/)?fmap' +
          '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_dir-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?_(?:' +
          suffixes.join('|') +
          ').(nii.gz|nii|json)$',
      )
      return conditionalMatch(anatRe, path)
    },

    isFieldMapMainNii: function(path) {
      var suffixes = ['phasediff', 'phase1', 'phase2', 'fieldmap', 'epi']
      var anatRe = new RegExp(
        '^\\/(sub-[a-zA-Z0-9]+)' +
          '\\/(?:(ses-[a-zA-Z0-9]+)' +
          '\\/)?fmap' +
          '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_dir-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?_(?:' +
          suffixes.join('|') +
          ').(nii.gz|nii)$',
      )
      return conditionalMatch(anatRe, path)
    },

    /**
     * Check if the file has a name appropriate for a functional scan
     */
    isFunc: function(path) {
      return conditionalMatch(re.funcRe, path)
    },

    isMeg: function(path) {
      return conditionalMatch(re.MegRe, path)
    },

    isEeg: function(path) {
      return conditionalMatch(re.EegRe, path)
    },

    isIEEG: function(path) {
      return conditionalMatch(re.IEEGRe, path)
    },

    isBehavioral: function(path) {
      return conditionalMatch(re.funcBehRe, path)
    },

    isFuncBold: function(path) {
      return conditionalMatch(re.funcBoldRe, path)
    },

    isCont: function(path) {
      return conditionalMatch(re.contRe, path)
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
