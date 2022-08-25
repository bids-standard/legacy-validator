import utils from '../../utils'
const Issue = utils.issues.Issue
import ometiff from './ometiff'
import validateTiffSignature from './validateTiffSignature'

const TIFF_ID = 0x2a
const BIG_TIFF_ID = 0x2b

const validate = (files, jsonContentsDict) => {
  let issues = []
  // validate ometiff
  const omePromises = files.map(function (file) {
    return utils.limit(
      () =>
        new Promise((resolve, reject) => {
          utils.files.readBuffer(file).then((buffer) => {
            if (validateTiffSignature(buffer, TIFF_ID)) {
              if (file.relativePath.endsWith('.ome.btf')) {
                issues.push(
                  new Issue({
                    code: 227,
                    file: file,
                    evidence: `Inconsistent TIFF file type and extension, given .ome.btf but should be .ome.tif`,
                  }),
                )
              }
              utils.files
                .readOMEFile(buffer)
                .then((omeData) => {
                  ometiff(
                    file,
                    omeData,
                    jsonContentsDict,
                    function (omeIssues) {
                      issues = issues.concat(omeIssues)
                      resolve()
                    },
                  )
                })
                .catch((err) =>
                  utils.issues.redirect(err, reject, () => {
                    issues.push(err)
                    resolve()
                  }),
                )
            } else if (validateTiffSignature(buffer, BIG_TIFF_ID)) {
              if (file.relativePath.endsWith('.ome.tif')) {
                issues.push(
                  new Issue({
                    code: 227,
                    file: file,
                    evidence: `Inconsistent TIFF file type and extension, given .ome.tif but should be .ome.btf`,
                  }),
                )
              }
              issues.push(
                new Issue({
                  code: 226,
                  file: file,
                }),
              )
              resolve()
            } else {
              issues.push(
                new Issue({
                  code: 227,
                  file: file,
                  evidence: `3rd byte of file does not identify file as tiff.`,
                }),
              )
              resolve()
            }
          })
        }),
    )
  })
  return Promise.all(omePromises).then(() => issues)
}

export default validate
