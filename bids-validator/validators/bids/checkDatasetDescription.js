const Issue = require('../../utils').issues.Issue

const checkDatasetDescription = jsonContentsDict => {
  let issues = []
  const jsonFilePaths = Object.keys(jsonContentsDict)
  const hasDatasetDescription = jsonFilePaths.some(path => {
    return path == '/dataset_description.json'
  })
  const hasGeneticInfo = jsonFilePaths.some(path => {
    return path === '/genetic_info.json'
  })

  if (!hasDatasetDescription) {
    issues.push(new Issue({ code: 57 }))
  } else {
    const datasetDescription = jsonContentsDict['/dataset_description.json']

    // check to ensure that the dataset description Authors are
    // properly formatted
    issues = issues.concat(checkAuthorField(datasetDescription.Authors))

    // if genetic info json present ensure mandatory GeneticDataset present
    if (
      hasGeneticInfo &&
      !(
        'Genetics' in datasetDescription &&
        'Dataset' in datasetDescription.Genetics
      )
    ) {
      issues.push(new Issue({ code: 128 }))
    }
  }
  return issues
}

const checkAuthorField = authors => {
  const issues = []
  // because this test happens before schema validation,
  // we have to make sure that authors is an array
  if (authors && typeof authors == 'object' && authors.length) {
    // if any author has more than one comma, throw an error
    authors.forEach(author => {
      if (('' + author).split(',').length > 2) {
        issues.push(new Issue({ code: 103, evidence: author }))
      }
    })
    // if authors is length 1, we want a warning for a single comma
    // and an error for multiple commas
    if (authors.length == 1) {
      const author = authors[0]
      // check the number of commas in the single author field
      if (typeof author == 'string' && author.split(',').length <= 2) {
        // if there is one or less comma in the author field,
        // we suspect that the curator has not listed everyone involved
        issues.push(new Issue({ code: 102, evidence: author }))
      }
    }
  } else {
    // if there are no authors,
    // warn user that errors could occur during doi minting
    // and that snapshots on OpenNeuro will not be allowed
    issues.push(new Issue({ code: 113, evidence: authors }))
  }
  return issues
}
export default checkDatasetDescription
