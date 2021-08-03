const Issue = require('../../utils').issues.Issue

const checkSamples = jsonContentsDict => {
  let issues = []
  const jsonFilePaths = Object.keys(jsonContentsDict)
  const hasSamples = jsonFilePaths.some(path => {
    return path == '/samples.json'
  })
  

  if (!hasSamples) {
    issues.push(new Issue({ code: 214 }))
  } else { }
  return issues
}

export default checkSamples
