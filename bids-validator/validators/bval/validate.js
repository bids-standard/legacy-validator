import utils from '../../utils'
import bval from './bval'

const validate = (files, bContentsDict, annexed, dir) => {
  let issues = []
  // validate bval
  const bvalPromises = files.map(function (file) {
    return utils.limit(
      () =>
        new Promise((resolve, reject) => {
          utils.files
            .readFile(file, annexed, dir)
            .then((contents) => {
              bContentsDict[file.relativePath] = contents
              bval(file, contents, function (bvalIssues) {
                issues = issues.concat(bvalIssues)
                resolve()
              })
            })
            .catch((err) =>
              utils.issues.redirect(err, reject, () => {
                issues.push(err)
                resolve()
              }),
            )
        }),
    )
  })
  return Promise.all(bvalPromises).then(() => issues)
}

export default validate
