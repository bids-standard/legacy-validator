/**
 * Quick Test
 *
 * A quick test to see if it could be a BIDS
 * dataset based on structure/naming. If it
 * could be it will trigger the full validation
 * otherwise it will throw a callback with a
 * generic error.
 */
const quickTest = (fileList) => {
  const keys = Object.keys(fileList)
  const couldBeBIDS = keys.some((key) => {
    const file = fileList[key]
    let path = file.relativePath
    if (path) {
      path = path.split('/')
      path = path.reverse()

      let pathIsSesOrSub =
        path[2] &&
        (path[2].indexOf('ses-') == 0 || path[2].indexOf('sub-') == 0)

      return pathIsSesOrSub
    }
  })
  return couldBeBIDS
}

export default quickTest
