const utils = require('../../utils')
const tsv = require('./tsv')

const validate = (
  files,
  fileList,
  tsvs,
  events,
  participants,
  phenotypeParticipants,
  stimuli,
  annexed,
  dir,
) => {
  let issues = []
  // validate tsv
  const tsvPromises = files.map(function(file) {
    return new Promise(resolve => {
      utils.files
        .readFile(file, annexed, dir)
        .then(contents => {
          // Push TSV to list for custom column verification after all data dictionaries have been read
          tsvs.push({
            file: file,
            contents: contents,
          })
          if (file.name.endsWith('_events.tsv')) {
            events.push({
              file: file,
              path: file.relativePath,
              contents: contents,
            })
          }
          tsv(file, contents, fileList, function(
            tsvIssues,
            participantList,
            stimFiles,
          ) {
            if (participantList) {
              if (file.name.endsWith('participants.tsv')) {
                participants = {
                  list: participantList,
                  file: file,
                }
              } else if (file.relativePath.includes('phenotype/')) {
                phenotypeParticipants.push({
                  list: participantList,
                  file: file,
                })
              }
            }
            if (stimFiles && stimFiles.length) {
              // add unique new events to the stimuli.events array
              stimuli.events = [...new Set([...stimuli.events, ...stimFiles])]
            }
            issues = issues.concat(tsvIssues)
            return resolve()
          })
        })
        .catch(issue => {
          issues = issues.concat(issue)
          return resolve()
        })
    })
  })

  return new Promise(resolve =>
    Promise.all(tsvPromises).then(() => resolve(issues)),
  )
}

module.exports = validate
