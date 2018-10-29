const assert = require('assert')
const utils = require('../utils')
const Subject = utils.files.sessions.Subject
const {
  session: missingSessionFiles,
  getDataOrganization,
  getFilename,
  missingSessionWarnings,
  getSubjectFiles,
  missingFileWarnings,
  checkFileInMissingSession,
  checkMissingFile,
} = require('../validators/session')
const dir = process.cwd()
const data_dir = dir + '/tests/data/'
const missing_session_data = data_dir + 'ds006_missing-session'
const missing_file_data = `${data_dir}bids-examples-1.1.1u1/ds006`

describe('session', () => {
  let filelist

  describe('missingSessionFiles', () => {
    describe('handling missing sessions', () => {
      beforeEach(() => {
        utils.files.readDir(missing_session_data, files => {
          filelist = files
        })
      })

      it('should produce a single MISSING_SESSION warning', () => {
        const warnings = missingSessionFiles(filelist)
        const targetWarning = warnings.find(
          warning => warning.key === 'MISSING_SESSION',
        )
        assert.ok(targetWarning)
      })

      it('should not produce INCONSISTENT_SUBJECTS warnings', () => {
        const warnings = missingSessionFiles(filelist)
        warnings.forEach(warning =>
          assert.notEqual(warning.key, 'INCONSISTENT_SUBJECTS'),
        )
      })
    })
  })

  describe('getDataOrganization', () => {
    it('should take a fileList of data with subjects and sessions and list and return them', () => {
      let filelist
      utils.files.readDir(missing_session_data, files => {
        filelist = files
      })

      const { subjects, sessions } = getDataOrganization(filelist)
      assert.equal(typeof subjects, 'object')

      const subjKeys = Object.keys(subjects)
      assert.ok(subjKeys.length >= 1)
      assert.ok(subjKeys.every(key => subjects[key] instanceof Subject))
      assert.ok(sessions.length >= 1)
    })
  })

  describe('getFilename', () => {
    it('should be able to extract the filename from its path', () => {
      const subjKey = 'sub-01'
      const paths = [
        '/sub-01/ses-post/anat/sub-01_ses-post_inplaneT2.nii.gz',
        '/sub-01/ses-post/anat/sub-01_ses-post_T1w.nii.gz',
        '/sub-01/ses-post/func/sub-01_ses-post_task-livingnonlivingdecisionwithplainormirrorreversedtext_run-01_bold.nii.gz',
      ]
      const expecteds = [
        '/ses-post/anat/<sub>_ses-post_inplaneT2.nii.gz',
        '/ses-post/anat/<sub>_ses-post_T1w.nii.gz',
        '/ses-post/func/<sub>_ses-post_task-livingnonlivingdecisionwithplainormirrorreversedtext_run-01_bold.nii.gz',
      ]

      for (let i = 0; i < paths.length; i++) {
        const result = getFilename(paths[i], subjKey)
        assert.equal(result, expecteds[i])
      }
    })
  })

  describe('missingSessionWarnings', () => {
    it('should take a subjects dir and a sessions list and return a list of issues', () => {
      let filelist
      utils.files.readDir(missing_session_data, files => {
        filelist = files
      })
      const { subjects, sessions } = getDataOrganization(filelist)

      const sessionWarnings = missingSessionWarnings(subjects, sessions)
      assert.ok(Array.isArray(sessionWarnings))
      assert.ok(
        sessionWarnings.every(warning => warning instanceof utils.issues.Issue),
      )
    })
  })

  describe('getSubjectFiles', () => {
    it('should take a list of subjects and return a set containing each file', () => {
      let filelist
      utils.files.readDir(missing_session_data, files => {
        filelist = files
      })
      const { subjects } = getDataOrganization(filelist)

      const subjFiles = getSubjectFiles(subjects)
      assert.ok(subjFiles.every(filename => typeof filename === 'string'))
      assert.equal(subjFiles.length, new Set(subjFiles).size)

      const allFiles = Object.keys(subjects).reduce(
        (allFiles, subjKey) => allFiles.concat(subjects[subjKey].files),
        [],
      )
      assert.ok(allFiles.every(file => subjFiles.includes(file)))
    })
  })

  describe('missingFileWarnings', () => {
    it('generates an issue for each file missing from each subject and returns them as a list', () => {
      let filelist
      utils.files.readDir(missing_file_data, files => {
        filelist = files
      })
      const { subjects } = getDataOrganization(filelist)
      const subjFiles = getSubjectFiles(subjects)

      const warnings = missingFileWarnings(subjects, subjFiles)
      assert.ok(Array.isArray(warnings))
      warnings.every(
        warning => warning instanceof utils.issues.Issue && warning.code === 38,
      )
    })
  })

  describe('checkFileInMissingSession', () => {
    it('returns true if filepath belongs to missing session', () => {
      const filepath = '/sub-01/ses-post/anat/sub-01_ses-post_inplaneT2.nii.gz'
      const subject = new Subject()
      subject.missingSessions.push('ses-post')

      const inMissingSession = checkFileInMissingSession(filepath, subject)
      assert.strictEqual(inMissingSession, true)
    })
    it('returns false if filepath belongs to extant session', () => {
      const filepath = '/sub-01/ses-post/anat/sub-01_ses-post_inplaneT2.nii.gz'
      const subject = new Subject()
      subject.sessions.push('ses-post')

      const inMissingSession = checkFileInMissingSession(filepath, subject)
      assert.strictEqual(inMissingSession, false)
    })
  })

  describe('checkMissingFile', () => {
    it('returns an issue if filename is missing from subject', () => {
      const subject = new Subject()
      const subjKey = 'sub-01'
      const filenames = [
        '/ses-post/anat/<sub>_ses-post_inplaneT2.nii.gz',
        '/ses-post/anat/<sub>_ses-post_T1w.nii.gz',
        '/ses-post/func/<sub>_ses-post_task-livingnonlivingdecisionwithplainormirrorreversedtext_run-01_bold.nii.gz',
      ]

      assert.equal(subject.files.length, 0)
      filenames.forEach(filename => {
        const warning = checkMissingFile(subject, subjKey, filename)
        assert.ok(warning instanceof utils.issues.Issue)
        assert.equal(warning.code, 38)
      })
    })
  })
})
