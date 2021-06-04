import Issue from '../../utils/issues/issue.js'
import isNode from '../../utils/isNode'

const checkReadme = fileList => {
  const issues = []
  const fileKeys = Object.keys(fileList)
  const readmeFile = Array.from(Object.values(fileList)).find(
    file => file.relativePath && file.relativePath == '/README',
  )
  if (readmeFile) {
    const size = !isNode ? readmeFile.size : readmeFile.stats.size
    const failsSizeRequirement = size <= 150
    if (failsSizeRequirement) {
      issues.push(new Issue({ code: 213 }))
    }
  } else {
    issues.push(new Issue({ code: 101 }))
  }
  return issues
}
export default checkReadme
