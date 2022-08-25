/* eslint-disable no-unused-vars */
import hed from './hed'

import utils from '../../utils'
const Issue = utils.issues.Issue

export default function (
  events,
  stimuli,
  headers,
  jsonContents,
  jsonFiles,
  dir,
) {
  const issues = []
  // check that all stimuli files present in /stimuli are included in an _events.tsv file
  const stimuliIssues = checkStimuli(stimuli)

  // check the events file for suspiciously long or short durations
  const designIssues = checkDesignLength(events, headers, jsonContents)

  // check the HED strings
  return hed(events, jsonContents, jsonFiles, dir).then((hedIssues) => {
    return issues.concat(stimuliIssues, designIssues, hedIssues)
  })
}

const checkStimuli = function (stimuli) {
  const issues = []
  const stimuliFromEvents = stimuli.events
  const stimuliFromDirectory = stimuli.directory
  if (stimuliFromDirectory) {
    const unusedStimuli = stimuliFromDirectory.filter(function (stimuli) {
      return stimuliFromEvents.indexOf(stimuli.relativePath) < 0
    })
    for (let key of unusedStimuli) {
      const stimulus = unusedStimuli[key]
      issues.push(
        new Issue({
          code: 77,
          file: stimulus,
        }),
      )
    }
  }
  return issues
}

const checkDesignLength = function (events, headers, jsonContents) {
  const issues = []
  // get all headers associated with task data
  const taskHeaders = headers.filter((header) => {
    const file = header[0]
    return file.relativePath.includes('_task-')
  })

  // loop through headers with files that are tasks
  taskHeaders.forEach((taskHeader) => {
    // extract the fourth element of 'dim' field of header - this is the
    // number of volumes that were obtained during scan (numVols)
    const file = taskHeader[0]
    const header = taskHeader[1]
    const dim = header.dim
    const numVols = dim[4]

    // get the json sidecar dictionary associated with that nifti scan
    const potentialSidecars = utils.files.potentialLocations(
      file.relativePath.replace('.gz', '').replace('.nii', '.json'),
    )
    const mergedDictionary = utils.files.generateMergedSidecarDict(
      potentialSidecars,
      jsonContents,
    )

    // extract the 'RepetitionTime' field from said sidecar (TR)
    const TR = mergedDictionary.RepetitionTime

    // calculate max reasonable scan time (TR * numVols = longDurationThreshold)
    const longDurationThreshold = Math.floor(TR * numVols)

    // calculate min reasonable scan time (.5 * TR * numVols = shortDurationThreshold)
    const shortDurationThreshold = Math.floor(0.5 * longDurationThreshold)

    // get the _events.tsv associated with this task scan
    const potentialEvents = utils.files.potentialLocations(
      file.relativePath.replace('.gz', '').replace('bold.nii', 'events.tsv'),
    )
    const associatedEvents = events.filter(
      (event) => potentialEvents.indexOf(event.path) > -1,
    )

    // loop through all events associated with this task scan
    for (let event of associatedEvents) {
      // get all non-empty rows
      const rows = event.contents
        .split('\n')
        .filter((row) => !(!row || /^\s*$/.test(row)))

      // get the 'onset' field of the last event (lastEventOnset)
      const lastEventOnset = rows[rows.length - 1].trim().split('\t')[0]

      // check if lastEventOnset > longDurationThreshold - append issue if so
      if (lastEventOnset > longDurationThreshold) {
        issues.push(
          new Issue({
            file: event.file,
            code: 85,
          }),
        )
      }

      // check if the lastEventOnset < shortDurationThreshold - append issue if so
      if (lastEventOnset < shortDurationThreshold) {
        issues.push(
          new Issue({
            file: event.file,
            code: 86,
          }),
        )
      }
    }
  })
  return issues
}
