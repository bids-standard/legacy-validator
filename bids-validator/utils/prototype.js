/**
 * Prototype
 *
 * A collection to extensions to native javascript prototypes.
 */

// String - Ends With (Polyfill based on MDN recommendation)
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, position) {
    var subjectString = this.toString()
    if (
      typeof position !== 'number' ||
      !isFinite(position) ||
      Math.floor(position) !== position ||
      position > subjectString.length
    ) {
      position = subjectString.length
    }
    position -= searchString.length
    var lastIndex = subjectString.indexOf(searchString, position)
    return lastIndex !== -1 && lastIndex === position
  }
}

// String - Includes
if (!String.prototype.includes) {
  String.prototype.includes = function () {
    'use strict'
    return String.prototype.indexOf.apply(this, arguments) !== -1
  }
}
