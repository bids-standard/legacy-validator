const utils = require('../../utils')
const bval = require('./bval')

const validate = (files, bContentsDict, annexed, dir) => {
  let issues = []
  // validate bval
  const bvalPromises = files.map(function(file) {
    return new Promise(resolve => {
      utils.files
        .readFile(file, annexed, dir)
        .then(contents => {
          bContentsDict[file.relativePath] = contents
          bval(file, contents, function(bvalIssues) {
            issues = issues.concat(bvalIssues)
            resolve()
          })
        })
        .catch(issue => {
          issues.push(issue)
          resolve()
        })
    })
  })

  return new Promise(resolve =>
    Promise.all(bvalPromises).then(() => resolve(issues)),
  )
}

module.exports = validate
