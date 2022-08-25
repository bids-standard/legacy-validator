import list from './list'
import Issue from './issue'
import config from '../config'

var issues = {
  /**
   * List
   *
   * List of all validator issues.
   */
  list: list,

  /**
   * Issue
   *
   * Issue constructor
   */
  Issue: Issue,

  /**
   * Filter Fieldmaps
   *
   * Remove fieldmap related warnings if no fieldmaps
   * are present.
   */
  filterFieldMaps: function (issueList) {
    var filteredIssueList = []
    var fieldmapRelatedCodes = [6, 7, 8, 9]
    for (var i = 0; i < issueList.length; i++) {
      var issue = issueList[i]
      if (fieldmapRelatedCodes.indexOf(issue.code) < 0) {
        filteredIssueList.push(issue)
      }
    }
    return filteredIssueList
  },

  /**
   * Format Issues
   */
  format: function (issueList, summary, options) {
    var errors = [],
      warnings = [],
      ignored = []

    if (summary.modalities.indexOf('fieldmap') < 0) {
      issueList = this.filterFieldMaps(issueList)
    }

    // sort alphabetically by relative path of files
    issueList.sort(function (a, b) {
      var aPath = a.file ? a.file.relativePath : ''
      var bPath = b.file ? b.file.relativePath : ''
      return aPath > bPath ? 1 : bPath > aPath ? -1 : 0
    })

    // organize by issue code
    const categorized = {}
    const codes = []
    for (var i = 0; i < issueList.length; i++) {
      var issue = issueList[i]

      if (
        issue.file &&
        config.ignoredFile(options.config, issue.file.relativePath)
      ) {
        continue
      }

      if (!categorized[issue.code]) {
        codes.push(issue.key)
        codes.push(issue.code)
        categorized[issue.code] = list[issue.code]
        categorized[issue.code].files = []
        categorized[issue.code].additionalFileCount = 0
        categorized[issue.code].helpUrl = issue.helpUrl
      }
      if (options.verbose || categorized[issue.code].files.length < 10) {
        categorized[issue.code].files.push(issue)
      } else {
        categorized[issue.code].additionalFileCount++
      }
    }

    const severityMap = config.interpret(codes, options.config)

    // organize by severity
    for (const codePropertyName in categorized) {
      if (!categorized.hasOwnProperty(codePropertyName)) {
        continue
      }
      // Properties are always strings but error codes are always integers
      const code = parseInt(codePropertyName)
      issue = categorized[code]
      issue.code = code

      if (severityMap.hasOwnProperty(issue.code)) {
        issue.severity = severityMap[issue.code]
      }

      if (severityMap.hasOwnProperty(issue.key)) {
        issue.severity = severityMap[issue.key]
      }
      if (issue.severity === 'error') {
        // Schema validation issues will yield the JSON file invalid, we should display them first to attract
        // user attention.
        if (code == 55) {
          errors.unshift(issue)
        } else {
          errors.push(issue)
        }
      } else if (issue.severity === 'warning' && !options.ignoreWarnings) {
        warnings.push(issue)
      } else if (issue.severity === 'ignore') {
        ignored.push(issue)
      }
    }
    return { errors, warnings, ignored }
  },

  /**
   * Error To Issue
   *
   * Takes and exception and returns an Issue
   */
  errorToIssue: function (err, code = 0) {
    const callStack = err.stack
      ? err.stack.split('\n').slice(1).join('\n').trim()
      : ''

    return new Issue({
      file: callStack,
      evidence: err.stack || '',
      reason: `${err.message}; please help the BIDS team and community by opening an issue at (https://github.com/bids-standard/bids-validator/issues) with the evidence here.`,
      code: code,
    })
  },

  /**
   * isAnIssue
   *
   * takes an object and checks if it's an Issue
   */
  isAnIssue: function (obj) {
    const objKeys = Object.keys(obj)
    return objKeys.includes('code') && objKeys.includes('reason')
  },

  /**
   * Reformat
   *
   * Takes an already formatted set of issues, a
   * summary and a config object and returns the
   * same issues reformatted against the config.
   */
  reformat: function (issueList, summary, config) {
    var errors = issueList.errors ? issueList.errors : [],
      warnings = issueList.warnings ? issueList.warnings : [],
      ignored = issueList.ignored ? issueList.ignored : []

    issueList = errors.concat(warnings).concat(ignored)
    var unformatted = []
    for (var i = 0; i < issueList.length; i++) {
      var issue = issueList[i]
      for (var j = 0; j < issue.files.length; j++) {
        var file = issue.files[j]
        unformatted.push(file)
      }
    }
    return issues.format(unformatted, summary, { config: config })
  },
  /**
   * Exception Handler
   *
   * takes an error in fullTest.js catch
   * converts it to an Issue and pushes it to the total list of issues
   * formats issue list and returns it
   */
  exceptionHandler: function (err, issueList, summary, options) {
    // err here can be a validator Issue or an unknown exception
    if (err.hasOwnProperty('key')) {
      issueList.push(err)
    } else {
      issueList.push(this.errorToIssue(err))
    }

    // Format issues
    const issues = this.format(issueList, summary, options)
    return issues
  },

  /**
   * Error/Issue redirector
   *
   * takes an error, resolve callback, and reject callback
   */
  redirect: function (err, reject, resolveCB) {
    if (this.isAnIssue(err)) {
      resolveCB()
    } else {
      reject(err)
    }
  },
}

export default Object.assign(Issue, issues)
