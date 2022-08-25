import path from 'path'
import utils from '../../utils'
const Issue = utils.issues.Issue
import isNode from '../../utils/isNode'

/*
 * Generates an error for quickTest failures
 */
const quickTestError = function (dir) {
  let filename
  if (isNode) {
    // For Node, grab the path from the dir string
    filename = path.basename(dir)
  } else {
    filename = constructFileName(dir)
  }
  const issue = new Issue({
    code: 61,
    file: {
      name: filename,
      path: path.join('.', filename),
      relativePath: path.join('', filename),
    },
  })
  return issue
}

const constructFileName = (dir) => {
  try {
    return dir[0].webkitRelativePath.split(path.sep).pop()
  } catch (err) {
    return 'uploaded-directory'
  }
}

export default quickTestError
