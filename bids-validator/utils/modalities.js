export default {
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

    for (
      var groupTouple_i = 0;
      groupTouple_i < modalityGroups.length;
      groupTouple_i++
    ) {
      var groupSet = modalityGroups[groupTouple_i][0]
      var groupName = modalityGroups[groupTouple_i][1]
      var match = true
      for (var i = 0; i < groupSet.length; i++) {
        if (modalities.indexOf(groupSet[i]) === -1) {
          match = false
        }
      }
      if (match) {
        modalities.push(groupName)
        for (var j = 0; j < groupSet.length; j++) {
          modalities.splice(modalities.indexOf(groupSet[j]), 1)
        }
      }
    }

    return modalities
  },
}
