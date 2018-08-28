const utils = require('../../utils')
const bval = require('./bval.js')

function validate(file, bContentsDict, issues, callback) {
  utils.files.readFile(file, function(issue, contents) {
    if (issue) {
      issues.push(issue)
      callback()
      return
    }
    bContentsDict[file.relativePath] = contents
    bval(file, contents, function(bvalIssues) {
      issues = issues.concat(bvalIssues)
      callback()
    })
  })
}

module.exports = validate
