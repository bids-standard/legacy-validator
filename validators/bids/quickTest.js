const utils = require('../../utils')

/**
 * Quick Test
 *
 * A quick test to see if it could be a BIDS
 * dataset based on structure/naming. If it
 * could be it will trigger the full validation
 * otherwise it will throw a callback with a
 * generic error.
 */
function quickTest(BIDS, fileList, callback) {
  const keys = Object.keys(fileList)
  const couldBeBIDS = keys.some(key => {
    const file = fileList[key]
    let path = file.relativePath
    if (path) {
      path = path.split('/')
      path = path.reverse()

      const isCorrectModality = utils.modalities.isCorrectModality(
        path,
        BIDS.options,
      )

      let pathIsSesOrSub =
        path[2] &&
        (path[2].indexOf('ses-') == 0 || path[2].indexOf('sub-') == 0)

      return pathIsSesOrSub && isCorrectModality
    }
    return false
  })
  callback(couldBeBIDS)
}

module.exports = quickTest
