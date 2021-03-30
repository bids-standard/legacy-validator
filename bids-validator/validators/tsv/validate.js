import utils from '../../utils'
import tsv from './tsv'

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
  let participantsTsvContent = ''
  // validate tsv
  const tsvPromises = files.map(function(file) {
    return utils.limit(
      () =>
        new Promise((resolve, reject) => {
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
                    // save content for metadata extraction
                    participantsTsvContent = contents
                  } else if (file.relativePath.includes('phenotype/')) {
                    phenotypeParticipants.push({
                      list: participantList,
                      file: file,
                    })
                  }
                }
                if (stimFiles && stimFiles.length) {
                  // add unique new events to the stimuli.events array
                  stimuli.events = [
                    ...new Set([...stimuli.events, ...stimFiles]),
                  ]
                }
                issues = issues.concat(tsvIssues)
                return resolve()
              })
            })
            .catch(reject)
        }),
    )
  })
  return Promise.all(tsvPromises).then(() => ({
    tsvIssues: issues,
    participantsTsvContent,
  }))
}

export default validate
