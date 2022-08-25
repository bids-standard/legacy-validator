const PARTICIPANT_ID = 'participantId'
/**
 * Go from tsv format string with participant_id as a required header to array of form
 * [
 *   {
 *     participantId: 'participant_id_1'
 *     foo: 'x',
 *     ...
 *   },
 *   {
 *     participantId: 'participant_id_2'
 *     foo: 'y',
 *     ...
 *   }
 *   ...
 * ]
 *
 * returns null if participant_id is not a header or file contents do not exist
 * @param {string} participantsTsvContent
 */
const collectSubjectMetadata = (participantsTsvContent) => {
  if (participantsTsvContent) {
    const contentTable = participantsTsvContent
      .split(/\r?\n/)
      .filter((row) => row !== '')
      .map((row) => row.split('\t'))
    const [snakeCaseHeaders, ...subjectData] = contentTable
    const headers = snakeCaseHeaders.map((header) =>
      header === 'participant_id' ? PARTICIPANT_ID : header,
    )
    const targetKeys = [PARTICIPANT_ID, 'age', 'sex', 'group']
      .map((key) => ({
        key,
        index: headers.findIndex((targetKey) => targetKey === key),
      }))
      .filter(({ index }) => index !== -1)
    const participantIdKey = targetKeys.find(
      ({ key }) => key === PARTICIPANT_ID,
    )
    const ageKey = targetKeys.find(({ key }) => key === 'age')
    if (participantIdKey === undefined) return null
    else
      return subjectData
        .map((data) => {
          // this first map is for transforming any data coming out of participants.tsv:
          // strip subject ids to match metadata.subjects: 'sub-01' -> '01'
          data[participantIdKey.index] = data[participantIdKey.index].replace(
            /^sub-/,
            '',
          )
          // make age an integer
          if (ageKey) data[ageKey.index] = parseInt(data[ageKey.index])
          return data
        })
        .map((data) =>
          //extract all target metadata for each subject
          targetKeys.reduce(
            (subject, { key, index }) => ({
              ...subject,
              [key]: data[index],
            }),
            {},
          ),
        )
  }
}

export default collectSubjectMetadata
