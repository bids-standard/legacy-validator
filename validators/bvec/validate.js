const utils = require('../../utils')
const bvec = require('./bvec')

function validate(file, bContentsDict, issues, callback) {
  utils.files.readFile(file, function(issue, contents) {
    if (issue) {
      issues.push(issue)
      callback()
      return
    }
    bContentsDict[file.relativePath] = contents
    bvec(file, contents, function(bvecIssues) {
      issues = issues.concat(bvecIssues)
      callback()
    })
  })
}

module.exports = validate
