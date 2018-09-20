const utils = require('../../utils')
const bvec = require('./bvec')

const validate = (files, bContentsDict, annexed, dir) => {
  // validate bvec
  let issues = []
  const bvecPromises = files.map(function(file) {
    return new Promise(resolve => {
      utils.files
        .readFile(file, annexed, dir)
        .then(contents => {
          bContentsDict[file.relativePath] = contents
          bvec(file, contents, function(bvecIssues) {
            issues = issues.concat(bvecIssues)
            resolve()
          })
        })
        .catch(issue => {
          issues.push(issue)
          resolve()
        })
    })
  })

  return new Promise(resolve => {
    Promise.all(bvecPromises).then(() => resolve(issues))
  })
}

module.exports = validate
