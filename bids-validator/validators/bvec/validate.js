import utils from '../../utils'
import bvec from './bvec'

const validate = (files, bContentsDict, annexed, dir) => {
  // validate bvec
  let issues = []
  const bvecPromises = files.map(function (file) {
    return utils.limit(
      () =>
        new Promise((resolve, reject) => {
          utils.files
            .readFile(file, annexed, dir)
            .then((contents) => {
              bContentsDict[file.relativePath] = contents
              bvec(file, contents, function (bvecIssues) {
                issues = issues.concat(bvecIssues)
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
  return Promise.all(bvecPromises).then(() => issues)
}

export default validate
