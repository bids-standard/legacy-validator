import utils from '../../utils'
import ometiff from './ometiff'

const validate = (files, jsonContentsDict) => {
  let issues = []
  // validate ometiff
  const omePromises = files.map(function(file) {
    return utils.limit(
      () =>
        new Promise((resolve, reject) => {
          utils.files
            .readOMEFile(file)
            .then(omeData => {
              ometiff(file, omeData, jsonContentsDict, function(omeIssues) {
                issues = issues.concat(omeIssues)
                resolve()
              })
            })
            .catch(err =>
              utils.issues.redirect(err, reject, () => {
                issues.push(err)
                resolve()
              }),
            )
        }),
    )
  })
  return Promise.all(omePromises).then(() => issues)
}

export default validate
