import BIDS from './obj'
import utils from '../../utils'
const Issue = utils.issues.Issue
import tsv from '../tsv'
import json from '../json'
import NIFTI from '../nifti'
import bval from '../bval'
import bvec from '../bvec'
import ometiff from '../microscopy'
import Events from '../events'
import { session } from '../session'
import checkAnyDataPresent from '../checkAnyDataPresent'
import headerFields from '../headerFields'
import subSesMismatchTest from './subSesMismatchTest'
import groupFileTypes from './groupFileTypes'
import subjects from './subjects'
import checkDatasetDescription from './checkDatasetDescription'
import checkReadme from './checkReadme'
import validateMisc from '../../utils/files/validateMisc'
import collectSubjectMetadata from '../../utils/summary/collectSubjectMetadata'
import collectPetFields from '../../utils/summary/collectPetFields'

/**
 * Full Test
 *
 * Takes on an array of files, callback, and boolean indicating if git-annex is used.
 * Starts the validation process for a BIDS package.
 */
const fullTest = (fileList, options, annexed, dir, schema, callback) => {
  const self = BIDS
  self.options = options

  const jsonContentsDict = {}
  const bContentsDict = {}
  const events = []
  const stimuli = {
    events: [],
    directory: [],
  }
  const jsonFiles = []
  const headers = []
  const participants = null
  const phenotypeParticipants = []

  const tsvs = []

  const summary = utils.collectSummary(fileList, self.options, schema)

  // remove size redundancies
  for (const key in fileList) {
    if (fileList.hasOwnProperty(key)) {
      const file = fileList[key]
      if (typeof file.stats === 'object' && file.stats.hasOwnProperty('size'))
        delete file.size
    }
  }

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
  if (!summary.dataTypes.includes('T1w')) {
    self.issues.push(
      new Issue({
        code: 53,
      }),
    )
  }

  validateMisc(files.misc)
    .then(miscIssues => {
      self.issues = self.issues.concat(miscIssues)

      // TSV validation
      return tsv.validate(
        files.tsv,
        fileList,
        tsvs,
        events,
        participants,
        phenotypeParticipants,
        stimuli,
      )
    })
    .then(({ tsvIssues, participantsTsvContent }) => {
      self.issues = self.issues.concat(tsvIssues)

      // extract metadata on participants to metadata.age and
      // return metadata on each subject from participants.tsv
      summary.subjectMetadata = collectSubjectMetadata(participantsTsvContent)
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
      const datasetDescriptionIssues = checkDatasetDescription(jsonContentsDict)
      self.issues = self.issues.concat(datasetDescriptionIssues)

      // Check for README file in the proper place
      const readmeIssues = checkReadme(fileList)
      self.issues = self.issues.concat(readmeIssues)

      // Check for samples file in the proper place (only for the microscopy modality)
      if (summary.modalities.includes('Microscopy')) {
        const samplesIssues = ometiff.checkSamples(fileList)
        const jsonAndFieldIssues = ometiff.checkJSONAndField(
          files,
          jsonContentsDict,
        )

        self.issues = self.issues
          .concat(samplesIssues)
          .concat(jsonAndFieldIssues)
      }
      // Validate json files and contents
      return json.validate(jsonFiles, fileList, jsonContentsDict, summary)
    })
    .then(jsonIssues => {
      self.issues = self.issues.concat(jsonIssues)

      // ome-tiff consistency check
      return ometiff.validate(files.ome, jsonContentsDict)
    })
    .then(omeIssues => {
      self.issues = self.issues.concat(omeIssues)
      // Nifti validation
      return NIFTI.validate(
        files.nifti,
        fileList,
        self.options,
        jsonContentsDict,
        bContentsDict,
        events,
        headers,
        annexed,
        dir,
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
      return Events.validateEvents(
        events,
        stimuli,
        headers,
        jsonContentsDict,
        jsonFiles,
        dir,
      )
    })
    .then(eventsIssues => {
      self.issues = self.issues.concat(eventsIssues)

      // Validate custom fields in all TSVs and add any issues to the list
      self.issues = self.issues.concat(
        tsv.validateTsvColumns(tsvs, jsonContentsDict, headers),
      )
      // Validate continuous recording files
      self.issues = self.issues.concat(
        tsv.validateContRec(files.contRecord, jsonContentsDict),
      )

      if (!options.ignoreSubjectConsistency) {
        // Validate session files
        self.issues = self.issues.concat(session(fileList))
      }

      // Determine if each subject has data present
      self.issues = self.issues.concat(
        checkAnyDataPresent(fileList, summary.subjects),
      )

      // Group summary modalities
      summary.modalities = utils.modalities.group(summary.modalities)

      // collect PET specific fields
      if (summary.modalities.includes('PET'))
        summary.pet = collectPetFields(jsonContentsDict)

      // Format issues
      const issues = utils.issues.format(self.issues, summary, self.options)
      callback(issues, summary)
    })
    .catch(err => {
      // take internal exceptions and push to issues
      // note: exceptions caught here may have skipped subsequent validations
      throw err
      const issues = utils.issues.exceptionHandler(
        err,
        self.issues,
        summary,
        self.options,
      )
      callback(issues, summary)
    })
}

export default fullTest
