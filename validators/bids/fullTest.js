const BIDS = require('./obj')
const utils = require('../../utils')
const Issue = utils.issues.Issue
const tsv = require('../tsv')
const json = require('../json')
const NIFTI = require('../nifti')
const bval = require('../bval')
const bvec = require('../bvec')
const Events = require('../events')
const { session } = require('../session')
const checkAnyDataPresent = require('../checkAnyDataPresent')
const headerFields = require('../headerFields')
const subSesMismatchTest = require('./subSesMismatchTest')
const groupFileTypes = require('./groupFileTypes')
const subjects = require('./subjects')
const checkDatasetDescription = require('./checkDatasetDescription')
const validateMisc = require('../../utils/files/validateMisc')

/**
 * Full Test
 *
 * Takes on an array of files and starts
 * the validation process for a BIDS
 * package.
 */
const fullTest = (fileList, options, callback) => {
  let self = BIDS
  self.options = options

  let jsonContentsDict = {},
    bContentsDict = {},
    events = [],
    stimuli = {
      events: [],
      directory: [],
    },
    jsonFiles = [],
    headers = [],
    participants = null,
    phenotypeParticipants = []

  let tsvs = []

  let summary = utils.collectSummary(fileList, self.options)

  // remove ignored files from list:
  Object.keys(fileList).forEach(function(key) {
    if (fileList[key].ignore) {
      delete fileList[key]
    }
  })

  self.issues = self.issues.concat(subSesMismatchTest(fileList))

  // check for illegal character in task name and acq name
  self.issues = self.issues.concat(utils.files.illegalCharacterTest(fileList))

  const files = groupFileTypes(fileList, self.options)

  // generate issues for all files that do not comply with
  // bids spec
  files.invalid.map(function(file) {
    self.issues.push(
      new Issue({
        file: file,
        evidence: file.name,
        code: 1,
      }),
    )
  })

  // check if dataset contains T1w
  if (summary.modalities.indexOf('T1w') < 0) {
    self.issues.push(
      new Issue({
        code: 53,
      }),
    )
  }

  // TSV validation
  tsv
    .validate(
      files.tsv,
      fileList,
      tsvs,
      events,
      participants,
      phenotypeParticipants,
      stimuli,
    )
    .then(tsvIssues => {
      self.issues = self.issues.concat(tsvIssues)

      // Bvec validation
      return bvec.validate(files.bvec, bContentsDict)
    })
    .then(bvecIssues => {
      self.issues = self.issues.concat(bvecIssues)

      // Bval validation
      return bval.validate(files.bval, bContentsDict)
    })
    .then(bvalIssues => {
      self.issues = self.issues.concat(bvalIssues)

      // Load json files and construct a contents object with field, value pairs
      return json.load(files.json, jsonFiles, jsonContentsDict)
    })
    .then(jsonLoadIssues => {
      self.issues = self.issues.concat(jsonLoadIssues)

      // Check for at least one subject
      const noSubjectIssues = subjects.atLeastOneSubject(fileList)
      self.issues = self.issues.concat(noSubjectIssues)

      // Check for datasetDescription file in the proper place
      const datasetDescriptionIssues = checkDatasetDescription(fileList)
      self.issues = self.issues.concat(datasetDescriptionIssues)

      // Validate json files and contents
      return json.validate(jsonFiles, fileList, jsonContentsDict, summary)
    })
    .then(jsonIssues => {
      self.issues = self.issues.concat(jsonIssues)

      // Nifti validation
      return NIFTI.validate(
        files.nifti,
        fileList,
        self.options,
        jsonContentsDict,
        bContentsDict,
        events,
        headers,
      )
    })
    .then(niftiIssues => {
      self.issues = self.issues.concat(niftiIssues)

      // Issues related to participants not listed in the subjects list
      const participantsInSubjectsIssues = subjects.participantsInSubjects(
        participants,
        summary.subjects,
      )
      self.issues = self.issues.concat(participantsInSubjectsIssues)

      // Check for equal number of participants from ./phenotype/*.tsv and participants in dataset
      const phenotypeIssues = tsv.checkPhenotype(phenotypeParticipants, summary)
      self.issues = self.issues.concat(phenotypeIssues)

      // Validate nii header fields
      self.issues = self.issues.concat(headerFields(headers))

      // Events validation
      stimuli.directory = files.stimuli
      const eventsIssues = Events.validateEvents(
        events,
        stimuli,
        headers,
        jsonContentsDict,
        self.issues,
      )
      self.issues = self.issues.concat(eventsIssues)

      // Validate custom fields in all TSVs and add any issues to the list
      self.issues = self.issues.concat(
        tsv.validateTsvColumns(tsvs, jsonContentsDict),
      )

      // Validate session files
      self.issues = self.issues.concat(session(fileList))

      // Determine if each subject has data present
      self.issues = self.issues.concat(
        checkAnyDataPresent(fileList, summary.subjects),
      )

      // Group summary modalities
      summary.modalities = utils.modalities.group(summary.modalities)

      // Format issues
      const issues = utils.issues.format(self.issues, summary, self.options)
      callback(issues, summary)
    })
    .catch(err => {
      // take internal exceptions and push to issues
      // note: exceptions caught here may have skipped subsequent validations
      const issues = utils.issues.exceptionHandler(
        err,
        self.issues,
        summary,
        self.options,
      )
      callback(issues, summary)
    })
}

module.exports = fullTest
