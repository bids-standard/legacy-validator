import isNode from '../isNode'
import getFileStats from './getFileStats'

const collectDirectorySize = (fileList) => {
  let size = 0
  const keys = Object.keys(fileList)
  keys.forEach((key) => {
    const file = fileList[key]
    // collect file stats
    if (file.size) {
      // from File api in browser
      size += file.size
      // or from git-annex metadata when in gitTreeMode
      if (isNode) file.stats = { size: file.size }
    } else {
      file.stats = getFileStats(file)
      size += file.stats.size
    }
  })
  return size
}

export default collectDirectorySize
