import utils from '../../utils'
const Issue = utils.issues.Issue

/**
 * Ensures that all continuous recording files have a corresponding json
 * file. The required fields are verified during json validation.
 * Further validation could be done here by extracting the tsv and
 * checking that the column count matches the length of the Names array
 * from the metadata.
 *
 * @param {Object[]} contRecordings - Array of continuous recording file
 * objects.
 * @param {Object[]} jsonContentsDict - content of all json files found.
 * @returns {Object[]} Array of issues generated during validation.
 */
const validateContRec = function (contRecordings, jsonContentsDict) {
  const issues = []
  contRecordings.map((contRecording) => {
    // Get merged data dictionary for this file
    const potentialSidecars = utils.files.potentialLocations(
      contRecording.relativePath.replace('.tsv.gz', '.json'),
    )

    const mergedDictionary = utils.files.generateMergedSidecarDict(
      potentialSidecars,
      jsonContentsDict,
    )
    if (Object.values(mergedDictionary).length === 0) {
      issues.push(
        new Issue({
          file: contRecording,
          code: 133,
        }),
      )
    }
  })
  return issues
}

export default validateContRec
