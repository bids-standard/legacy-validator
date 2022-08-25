import minimatch from 'minimatch'

var config = {
  /**
   * Ignored File
   */
  ignoredFile: function (conf, filePath) {
    if (conf.ignoredFiles) {
      for (var i = 0; i < conf.ignoredFiles.length; i++) {
        var ignoredPattern = conf.ignoredFiles[i]
        if (minimatch(filePath, ignoredPattern)) {
          return true
        }
      }
    }
    return false
  },

  /**
   * Interpret Config
   *
   * Takes a list of triggered codes and a config object
   * and create a map of modified severities
   */
  interpret: function (codes, conf) {
    var severityMap = {}

    if (conf.ignore && conf.ignore.length > 0) {
      var ignoreCodes = this.match(codes, conf.ignore)
      for (var i = 0; i < ignoreCodes.length; i++) {
        var ignoreCode = ignoreCodes[i]
        severityMap[ignoreCode] = 'ignore'
      }
    }

    if (conf.warn && conf.warn.length > 0) {
      var warnCodes = this.match(codes, conf.warn)
      for (var j = 0; j < warnCodes.length; j++) {
        var warnCode = warnCodes[j]
        severityMap[warnCode] = 'warning'
      }
    }

    if (conf.error && conf.error.length > 0) {
      var errorCodes = this.match(codes, conf.error)
      for (var k = 0; k < errorCodes.length; k++) {
        var errorCode = errorCodes[k]
        severityMap[errorCode] = 'error'
      }
    }

    return severityMap
  },

  /**
   * Match
   *
   * Takes a list of triggered codes and a config
   * object and returns the matched codes.
   */
  match: function (codes, conf) {
    var matches = []
    for (var i = 0; i < conf.length; i++) {
      var confCode = conf[i]
      if (codes.indexOf(confCode) > -1) {
        matches.push(confCode)
      } else if (
        confCode.hasOwnProperty('and') &&
        this.andFulfilled(codes, confCode.and)
      ) {
        // 'and' array fulfilled
        matches = matches.concat(this.flatten(confCode.and))
      }
    }
    return matches
  },

  /**
   * Flatten
   *
   * Takes an array that may contain objects with
   * 'and' or 'or' properties and flattens it.
   */
  flatten: function (list) {
    var codes = []
    for (var i = 0; i < list.length; i++) {
      var code = list[i]
      if (code.hasOwnProperty('and')) {
        codes = codes.concat(this.flatten(code.and))
      } else if (code.hasOwnProperty('or')) {
        codes = codes.concat(this.flatten(code.or))
      } else {
        codes.push(code)
      }
    }
    return codes
  },

  /**
   * And Fulfilled
   *
   * Takes an array of triggered code and an 'and'
   * array, recursively checks if it's fulfilled
   * and returns true if it is.
   */
  andFulfilled: function (codes, and) {
    for (var i = 0; i < and.length; i++) {
      var andCode = and[i]
      if (andCode.hasOwnProperty('and')) {
        if (!this.andFulfilled(codes, andCode.and)) {
          return false
        }
      } else if (andCode.hasOwnProperty('or')) {
        if (!this.orFulfilled(codes, andCode.or)) {
          return false
        }
      } else if (codes.indexOf(andCode) < 0) {
        return false
      }
    }
    return true
  },

  /**
   * Or Fulfilled
   *
   * Takes an array of triggered code and an 'or'
   * array, recursively checks if it's fulfilled
   * and returns true if it is.
   */
  orFulfilled: function (codes, or) {
    for (var i = 0; i < or.length; i++) {
      var orCode = or[i]
      if (orCode.hasOwnProperty('and')) {
        if (this.andFulfilled(codes, orCode.and)) {
          return true
        }
      } else if (orCode.hasOwnProperty('or')) {
        if (this.orFulfilled(codes, orCode.or)) {
          return true
        }
      } else if (codes.indexOf(orCode) > -1) {
        return true
      }
    }
    return false
  },
}

export default config
