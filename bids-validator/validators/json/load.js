import utils from '../../utils'

class JSONParseError extends Error {
  constructor(message) {
    super(message)
    this.name = 'JSONParseError'
  }
}

const load = (files, jsonFiles, jsonContentsDict, annexed, dir) => {
  let issues = []

  // Read JSON file contents and parse for issues
  const readJsonFile = (file, annexed, dir) =>
    utils.files
      .readFile(file, annexed, dir)
      .then((contents) => utils.json.parse(file, contents))
      .then(({ issues: parseIssues, parsed }) => {
        // Append any parse issues to returned issues
        Array.prototype.push.apply(issues, parseIssues)

        // Abort further tests if an error is found
        if (
          parseIssues &&
          parseIssues.some((issue) => issue.severity === 'error')
        ) {
          throw new JSONParseError('Aborted due to parse error')
        }

        jsonContentsDict[file.relativePath] = parsed
        jsonFiles.push(file)
      })

  // Start concurrent read/parses
  const fileReads = files.map((file) =>
    utils.limit(() => readJsonFile(file, annexed, dir)),
  )

  // After all reads/parses complete, return any found issues
  return Promise.all(fileReads)
    .then(() => issues)
    .catch((err) => {
      // Handle early exit
      if (err instanceof JSONParseError) {
        return issues
      } else {
        throw err
      }
    })
}

export default load
