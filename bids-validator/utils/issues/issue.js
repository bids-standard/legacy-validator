import issues from './list'

/**
 * Help Url
 *
 * Construct a link to a helpful neurostars query, based on the
 * issue key
 */
const constructHelpUrl = (issue) => {
  const neurostarsPrefix = 'https://neurostars.org/'
  const searchQuery = issue && issue.key ? 'search?q=' + issue.key : ''
  const helpUrl = neurostarsPrefix + searchQuery
  return helpUrl
}

/**
 * Issue
 *
 * A constructor for BIDS issues.
 *
 * @param {Object} options
 * @param {string} options.key The descriptive string matching the issue code
 * @param {number} options.code Issue code - see 'list.js' for definitions
 * @param {File} [options.file] File object for the affected file
 * @param {string} [options.evidence] The value throwing this issue
 * @param {number} [options.line] The line of the affected file (if within a file)
 * @param {number} [options.character] The character offset in the affected line
 * @param {string} [options.severity] Is this an error or warning?
 * @param {string} [options.reason] A descriptive
 * @param {string} [options.helpUrl] A URL providing documentation to help solve this error
 * @returns {Object} Issue object
 */
function Issue(options) {
  const code = options.hasOwnProperty('code') ? options.code : null
  const issue = issues[code]

  this.key = issue.key
  this.code = code
  this.file = options.hasOwnProperty('file') ? options.file : null
  this.evidence = options.hasOwnProperty('evidence') ? options.evidence : null
  this.line = options.hasOwnProperty('line') ? options.line : null
  this.character = options.hasOwnProperty('character')
    ? options.character
    : null
  this.severity = options.hasOwnProperty('severity')
    ? options.severity
    : issue.severity
  this.reason = options.hasOwnProperty('reason') ? options.reason : issue.reason
  this.helpUrl = constructHelpUrl(issue)
}

export default Issue
