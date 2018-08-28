var array = {
  /**
   * Equals
   *
   * Takes two arrays and returns true if they're
   * equal. Takes a third optional boolean argument
   * to sort arrays before checking equality.
   */
  equals: function(array1, array2, sort) {
    let equals = true
    // if the other array is a falsy value, return
    const rightFormat =
      array.bothValid(array1, array2) && array.sameLength(array1, array2)

    // optionally sort arrays
    if (rightFormat && sort) {
      array1.sort()
      array2.sort()
    }

    if (rightFormat) {
      array1.map((item, idx) => {
        if (array.isArray(item) && array.isArray(array2[idx])) {
          if (!array.equals(item, array2[idx], sort)) {
            equals = false
          } else if (item != array2[idx]) {
            equals = false
          }
        }
      })
    }
    return equals
  },

  bothValid: function(array1, array2) {
    let isValid = true
    if (!array1 || !array2) {
      isValid = false
    }
    return isValid
  },

  sameLength: function(array1, array2) {
    let sameLength = true

    // compare lengths
    if (array1.length != array2.length) {
      sameLength = false
    }

    return sameLength
  },

  isArray: function(array) {
    return array instanceof Array
  },

  /**
   * Takes to arrays and returns an array of two
   * arrays contains the differences contained
   * in each array.
   */
  diff: function(array1, array2) {
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

module.exports = array
