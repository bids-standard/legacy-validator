const testFile = require('./testFile')
const Issue = require('../issues/issue')

/**
 * validateMisc
 *
 * takes a list of files and returns an issue for each file
 */
module.exports = function validateMisc(miscFiles) {
  const issuePromises = miscFiles.reduce(
    (issues, file) => [...issues, testFile(file)],
    [],
  )
  return Promise.all(issuePromises).then(res =>
    res
      // extract issue
      .map(obj => obj.issue)
      // remove non-issues
      .filter(o => o instanceof Issue),
  )
}
