import isNode from '../../utils/isNode'

const Issue = require('../../utils').issues.Issue

const checkSamples = fileList => {
  const issues = []
  const fileKeys = Object.keys(fileList)
  const samplesFile = Array.from(Object.values(fileList)).find(
    file => file.relativePath && file.relativePath == '/samples.tsv',
  )
  if (!samplesFile) {
    issues.push(new Issue({ code: 214 }))
  }
  return issues
}
export default checkSamples
