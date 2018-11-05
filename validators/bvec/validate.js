const utils = require('../../utils')
const bvec = require('./bvec')

const validate = (files, bContentsDict) => {
  // validate bvec
  let issues = []
  const bvecPromises = files.map(function(file) {
    return new Promise((resolve, reject) => {
      utils.files
        .readFile(file)
        .then(contents => {
          bContentsDict[file.relativePath] = contents
          bvec(file, contents, function(bvecIssues) {
            issues = issues.concat(bvecIssues)
            resolve()
          })
        })
        .catch(err =>
          utils.issues.redirect(err, reject, () => {
            issues.push(err)
            resolve()
          }),
        )
    })
  })
  return Promise.all(bvecPromises).then(() => issues)
}

module.exports = validate
