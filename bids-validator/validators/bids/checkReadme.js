import Issue from '../../utils/issues/issue.js'

const checkReadme = fileList => {
  const issues = []
  const fileKeys = Object.keys(fileList)
  const hasReadme = fileKeys.some(key => {
    const file = fileList[key]
    return file.relativePath && file.relativePath == '/README'
  })
  if (!hasReadme) {
    issues.push(new Issue({ code: 101 }))
  }
  return issues
}
export default checkReadme
