const utils = require('../../utils')
const Issue = utils.issues.Issue

const checkPhenotype = (phenotypeParticipants, summary) => {
  const issues = []
  for (let j = 0; j < phenotypeParticipants.length; j++) {
    const fileParticipants = phenotypeParticipants[j]
    const participantList = fileParticipants.list.sort()
    const summarySubjects = summary.subjects.sort()
    if (!utils.array.equals(participantList, summarySubjects)) {
      const evidence = constructMissingPhenotypeEvidence(
        participantList,
        summarySubjects,
      )
      issues.push(
        new Issue({
          code: 51,
          evidence: evidence,
          file: fileParticipants.file,
        }),
      )
    }
  }
  return issues
}

const constructMissingPhenotypeEvidence = (fileParticipants, subjects) => {
  const diffs = utils.array.diff(fileParticipants, subjects)
  const subjectsNotInSummarySubjects = diffs[0]
  const subjectsNotInFileParticipants = diffs[1]
  const evidenceOfMissingParticipants = subjectsNotInFileParticipants.length
    ? 'Subjects ' +
      subjectsNotInFileParticipants.join(', ') +
      ' were found in the folder structure but are missing in phenotype/ .tsv. '
    : ''
  const evidenceOfMissingSubjects = subjectsNotInSummarySubjects.length
    ? 'Subjects ' +
      subjectsNotInSummarySubjects.join(', ') +
      ' were found in phenotype/ .tsv file but are not present in the folder structure. '
    : ''
  const evidence = evidenceOfMissingParticipants + evidenceOfMissingSubjects
  return evidence
}

module.exports = checkPhenotype
