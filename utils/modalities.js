module.exports = {
  /**
   * Group
   *
   * Takes an array of modalities and looks for
   * groupings defined in 'modalityGroups' and
   * replaces any perfectly matched groupings with
   * the grouping object key.
   */
  group: function(modalities) {
    var modalityGroups = [
      [['magnitude1', 'magnitude2', 'phase1', 'phase2'], 'fieldmap'],
      [['magnitude1', 'magnitude2', 'phasediff'], 'fieldmap'],
      [['magnitude1', 'phasediff'], 'fieldmap'],
      [['magnitude', 'fieldmap'], 'fieldmap'],
      [['epi'], 'fieldmap'],
    ]
    modalityGroups.map(group => {
      const groupSet = group[0]
      const groupName = group[1]
      let match = true
      groupSet.map(group => {
        const groupNotInModalityList = modalities.indexOf(group) === -1
        if (groupNotInModalityList) {
          match = false
        }
      })
      if (match) {
        modalities.push(groupName)
        groupSet.map(group => {
          modalities.splice(modalities.indexOf(group, 1))
        })
      }
    })
    return modalities
  },

  /**
   *
   */
  isCorrectModality: function(path, options) {
    var isCorrectModality = false
    // MRI
    if (
      path[0].includes('.nii') &&
      ['anat', 'func', 'dwi'].indexOf(path[1]) != -1
    ) {
      isCorrectModality = true
    } else if (path[0].includes('.json')) {
      const testPath = path[1]
      switch (testPath) {
        case 'meg':
          // MEG
          isCorrectModality = true
          break
        case 'eeg':
          // EEG
          isCorrectModality = !!options.bep006
          break
        case 'ieeg':
          // iEEG
          isCorrectModality = !!options.bep010
          break
        default:
          break
      }
    }
    return isCorrectModality
  },
}
