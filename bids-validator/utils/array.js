var array = {
  /**
   * Equals
   *
   * Takes two arrays and returns true if they're
   * equal. Takes a third optional boolean argument
   * to sort arrays before checking equality.
   */
  equals: function (array1, array2, sort) {
    // if the other array is a falsy value, return
    if (!array1 || !array2) {
      return false
    }

    // compare lengths
    if (array1.length != array2.length) {
      return false
    }

    // optionally sort arrays
    if (sort) {
      array1.sort()
      array2.sort()
    }

    for (var i = 0, l = array1.length; i < l; i++) {
      // Check if we have nested arrays
      if (array1[i] instanceof Array && array2[i] instanceof Array) {
        // recurse into the nested arrays
        if (!array.equals(array1[i], array2[i], sort)) {
          return false
        }
      } else if (array1[i] != array2[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false
      }
    }
    return true
  },

  /**
   * Takes to arrays and returns an array of two
   * arrays contains the differences contained
   * in each array.
   */
  diff: function (array1, array2) {
    var diff1 = [],
      diff2 = []
    for (var i = 0; i < array1.length; i++) {
      var elem1 = array1[i]
      var index = array2.indexOf(elem1)
      if (index > -1) {
        array2.splice(index, 1)
      } else {
        diff1.push(elem1)
      }
    }
    diff2 = array2
    return [diff1, diff2]
  },
}

export default array
