var issues = require('./list')

/**
 * Issue
 *
 * A constructor for BIDS issues.
 */
module.exports = function(options) {
  var code = getOption(options, 'code')
  var issue = issues[code]

  this.key = issue.key
  this.code = code
  this.file = getOption(options, 'file')
  this.evidence = getOption(options, 'evidence')
  this.line = getOption(options, 'line')
  this.character = getOption(options, 'character')
  this.severity = getOption(options, 'severity')
  this.reason = getOption(options, 'reason')
}

function getOption(options, field) {
  return options.hasOwnProperty(field) ? options[field] : null
}
