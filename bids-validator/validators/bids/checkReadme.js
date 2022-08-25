import isNode from '../../utils/isNode'

const Issue = require('../../utils').issues.Issue

const checkReadme = (fileList) => {
  const issues = []
  const readmeFiles = Array.from(Object.values(fileList)).filter(
    (file) => file.relativePath && file.relativePath.startsWith('/README'),
  )

  readmeFiles.map((readmeFile) => {
    const size = !isNode ? readmeFile.size : readmeFile.stats.size
    const failsSizeRequirement = size <= 150
    if (failsSizeRequirement) {
      issues.push(new Issue({ code: 213, file: readmeFile }))
    }
  })
  if (readmeFiles.length > 1) {
    issues.push(new Issue({ code: 228 }))
  } else if (readmeFiles.length === 0) {
    issues.push(new Issue({ code: 101 }))
  }
  return issues
}
export default checkReadme
