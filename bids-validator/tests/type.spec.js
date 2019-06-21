const { assert } = require('chai')
const utils = require('../utils')
const BIDS = require('../validators/bids')

describe('utils.type.file.isAnat', function() {
  const goodFilenames = [
    '/sub-15/anat/sub-15_inplaneT2.nii.gz',
    '/sub-15/ses-12/anat/sub-15_ses-12_inplaneT2.nii.gz',
    '/sub-16/anat/sub-16_T1w.nii.gz',
    '/sub-16/anat/sub-16_T1w.json',
    '/sub-16/anat/sub-16_run-01_T1w.nii.gz',
    '/sub-16/anat/sub-16_acq-highres_T1w.nii.gz',
    '/sub-16/anat/sub-16_rec-mc_T1w.nii.gz',
    '/sub-16/anat/sub-16_ce-contrastagent_T1w.nii.gz',
  ]

  goodFilenames.forEach(function(path) {
    it("isAnat('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isAnat(path), true)
      isdone()
    })
  })

  const badFilenames = [
    '/sub-1/anat/sub-15_inplaneT2.nii.gz',
    '/sub-15/ses-12/anat/sub-15_inplaneT2.nii.gz',
    '/sub-16/anat/sub-16_T1.nii.gz',
    'blaaa.nii.gz',
    '/sub-16/anat/sub-16_run-second_T1w.nii.gz',
    '/sub-16/anat/sub-16_run-01_rec-mc_T1w.nii.gz',
  ]

  badFilenames.forEach(function(path) {
    it("isAnat('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isAnat(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isFunc', function() {
  var goodFilenames = [
    '/sub-15/func/sub-15_task-0back_bold.nii.gz',
    '/sub-15/ses-12/func/sub-15_ses-12_task-0back_bold.nii.gz',
    '/sub-16/func/sub-16_task-0back_bold.json',
    '/sub-16/func/sub-16_task-0back_run-01_bold.nii.gz',
    '/sub-16/func/sub-16_task-0back_acq-highres_bold.nii.gz',
    '/sub-16/func/sub-16_task-0back_rec-mc_bold.nii.gz',
  ]

  goodFilenames.forEach(function(path) {
    it("isFunc('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isFunc(path), true)
      isdone()
    })
  })

  var badFilenames = [
    '/sub-1/func/sub-15_inplaneT2.nii.gz',
    '/sub-15/ses-12/func/sub-15_inplaneT2.nii.gz',
    '/sub-16/func/sub-16_T1.nii.gz',
    'blaaa.nii.gz',
    '/sub-16/func/sub-16_run-second_T1w.nii.gz',
    '/sub-16/func/sub-16_task-0-back_rec-mc_bold.nii.gz',
    '/sub-16/func/sub-16_run-01_rec-mc_T1w.nii.gz',
  ]

  badFilenames.forEach(function(path) {
    it("isFunc('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isFunc(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isTopLevel', function() {
  const goodFilenames = [
    '/README',
    '/CHANGES',
    '/dataset_description.json',
    '/ses-pre_task-rest_bold.json',
    '/dwi.bval',
    '/dwi.bvec',
    '/T1w.json',
    '/acq-test_dwi.json',
    '/rec-test_physio.json',
    '/task-testing_eeg.json',
    '/task-testing_ieeg.json',
    '/task-testing_meg.json',
  ]

  goodFilenames.forEach(function(path) {
    it("isTopLevel('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isTopLevel(path), true)
      isdone()
    })
  })

  const badFilenames = [
    '/readme.txt',
    '/changelog',
    '/dataset_description.yml',
    '/ses.json',
    '/_T1w.json',
    '/_dwi.json',
    '/_task-test_physio.json',
  ]

  badFilenames.forEach(function(path) {
    it("isTopLevel('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isTopLevel(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isSessionLevel', function() {
  const goodFilenames = [
    '/sub-12/sub-12_scans.tsv',
    '/sub-12/ses-pre/sub-12_ses-pre_scans.tsv',
  ]

  goodFilenames.forEach(function(path) {
    it("isSessionLevel('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isSessionLevel(path), true)
      isdone()
    })
  })

  const badFilenames = [
    '/sub-12/sub-12.tsv',
    '/sub-12/ses-pre/sub-12_ses-pre_scan.tsv',
  ]

  badFilenames.forEach(function(path) {
    it("isSessionLevel('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isSessionLevel(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isDWI', function() {
  const goodFilenames = [
    '/sub-12/dwi/sub-12_dwi.nii.gz',
    '/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.nii.gz',
    '/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvec',
    '/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bval',
  ]

  goodFilenames.forEach(function(path) {
    it("isDWI('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isDWI(path), true)
      isdone()
    })
  })

  const badFilenames = [
    '/sub-12/sub-12.tsv',
    '/sub-12/ses-pre/sub-12_ses-pre_scan.tsv',
    '/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvecs',
    '/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvals',
  ]

  badFilenames.forEach(function(path) {
    it("isDWI('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isDWI(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isMEG', function() {
  const goodFilenames = [
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_meg/sub-01_ses-001_task-rest_run-01_meg.sqd',
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_meg/sub-01_ses-001_task-rest_run-01_meg.raw.mhd',
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_meg/xyz', // for e.g., BTi files
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_meg/sub-01_ses-001_markers.sqd',
    '/sub-01/ses-001/meg/sub-01_ses-001_markers.sqd', // KIT with removed father level directory
    '/sub-01/ses-001/meg/sub-01_ses-001_markers.mrk', // KIT with removed father level directory
    '/sub-01/ses-001/meg/sub-01_ses-001_meg.sqd', // KIT with removed father level directory
    '/sub-01/ses-001/meg/sub-01_ses-001_meg.con', // KIT with removed father level directory
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_meg.json',
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_part-01_meg.fif',
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_channels.tsv',
  ]

  goodFilenames.forEach(function(path) {
    it("isMeg('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isMeg(path), true)
      isdone()
    })
  })

  const badFilenames = [
    // only parent directory name matters for KIT/BTi systems
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_megggg/sub-01_ses-001_task-rest_run-01_meg.sqd',
    '/sub-01/meg/sub-01_ses-001_task-rest_run-01_meg.json',
    '/sub-01/ses-001/meg/sub-12_ses-001_task-rest_run-01_part-01_meg.fif',
    '/sub-01/ses-001/meg/sub-01_ses-001_task-rest_run-01_meg.tsv',
  ]

  badFilenames.forEach(function(path) {
    it("isMeg('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isMeg(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isEEG', function() {
  const goodFilenames = [
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.json',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_events.tsv',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_part-01_eeg.edf',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.eeg',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.vmrk',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.vhdr',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.bdf',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.set',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.fdt',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_channels.tsv',
    '/sub-01/ses-001/eeg/sub-01_ses-001_electrodes.tsv',
    '/sub-01/ses-001/eeg/sub-01_ses-001_coordsystem.json',
    '/sub-01/ses-001/eeg/sub-01_ses-001_photo.jpg',
  ]

  goodFilenames.forEach(function(path) {
    it("isEEG('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isEEG(path), true)
      isdone()
    })
  })

  const badFilenames = [
    '/sub-01/eeg/sub-01_ses-001_task-rest_run-01_eeg.json',
    '/sub-01/ses-001/eeg/sub-12_ses-001_task-rest_run-01_part-01_eeg.edf',
    '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_eeg.tsv',
  ]

  badFilenames.forEach(function(path) {
    it("isEEG('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isEEG(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isIEEG', function() {
  const goodFilenames = [
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_ieeg.json',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.edf',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.vhdr',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.vmrk',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.eeg',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.set',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.fdt',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.nwb',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_part-01_ieeg.mef',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_channels.tsv',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_electrodes.tsv',
  ]

  goodFilenames.forEach(function(path) {
    it("isIEEG('" + path + "') === true", function(isdone) {
      assert.equal(utils.type.file.isIEEG(path), true)
      isdone()
    })
  })

  const badFilenames = [
    '/sub-01/ieeg/sub-01_ses-001_task-rest_run-01_ieeg.json',
    '/sub-01/ses-001/ieeg/sub-12_ses-001_task-rest_run-01_part-01_ieeg.fif',
    '/sub-01/ses-001/ieeg/sub-01_ses-001_task-rest_run-01_ieeg.tsv',
  ]

  badFilenames.forEach(function(path) {
    it("isIEEG('" + path + "') === false", function(isdone) {
      assert.equal(utils.type.file.isIEEG(path), false)
      isdone()
    })
  })
})

describe('utils.type.file.isPhenotypic', function() {
  it('should allow .tsv and .json files in the /phenotype directory', function() {
    assert(utils.type.file.isPhenotypic('/phenotype/acds_adult.json'))
    assert(utils.type.file.isPhenotypic('/phenotype/acds_adult.tsv'))
  })

  it('should not allow non .tsv and .json files in the /phenotype directory', function() {
    assert(!utils.type.file.isPhenotypic('/phenotype/acds_adult.jpeg'))
    assert(!utils.type.file.isPhenotypic('/phenotype/acds_adult.gif'))
  })
})

describe('utils.type.file.isAssociatedData', function() {
  it('should return false for unknown root directories', function() {
    var badFilenames = ['/images/picture.jpeg', '/temporary/test.json']

    badFilenames.forEach(function(path) {
      assert.equal(utils.type.file.isAssociatedData(path), false)
    })
  })

  it('should return true for associated data directories and any files within', function() {
    var goodFilenames = [
      '/code/test-script.py',
      '/derivatives/sub-01_QA.pdf',
      '/sourcedata/sub-01_ses-01_bold.dcm',
      '/stimuli/text.pdf',
    ]

    goodFilenames.forEach(function(path) {
      assert(utils.type.file.isAssociatedData(path))
    })
  })
})

describe('utils.type.file.isStimuliData', function() {
  it('should return false for unknown root directories', function() {
    var badFilenames = ['/images/picture.jpeg', '/temporary/test.json']

    badFilenames.forEach(function(path) {
      assert.equal(utils.type.file.isStimuliData(path), false)
    })
  })

  it('should return true for stimuli data directories and any files within', function() {
    var goodFilenames = ['/stimuli/sub-01/mov.avi', '/stimuli/text.pdf']

    goodFilenames.forEach(function(path) {
      assert(utils.type.file.isStimuliData(path))
    })
  })
})

describe('utils.type.getPathValues', function() {
  it('should return the correct path values from a valid file path', function() {
    assert.equal(
      utils.type.getPathValues(
        '/sub-22/ses-1/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
      ).sub,
      22,
    )
    assert.equal(
      utils.type.getPathValues(
        '/sub-22/ses-1/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
      ).ses,
      1,
    )
    assert.equal(
      utils.type.getPathValues(
        '/sub-22/func/sub-22_task-rest_acq-prefrontal_physio.tsv.gz',
      ).sub,
      22,
    )
    assert.equal(
      utils.type.getPathValues(
        '/sub-22/func/sub-22_task-rest_acq-prefrontal_physio.tsv.gz',
      ).ses,
      null,
    )
  })
})

describe('BIDS.subIDsesIDmismatchtest', function() {
  it('should return if sub and ses doesnt match', function() {
    const files = {
      '0': {
        name: 'sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
        path:
          'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
        relativePath:
          'ds001/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
      },
      '1': {
        name:
          '/sub-22/ses-1/func/sub-23_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
        path:
          'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-22/ses-1/func/sub-23_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
        relativePath:
          'ds001/sub-22/ses-1/func/sub-23_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
      },
      '2': {
        name:
          '/sub-22/ses-1/func/sub-22_ses-2_task-rest_acq-prefrontal_physio.tsv.gz',
        path:
          'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-22/ses-1/func/sub-22_ses-2_task-rest_acq-prefrontal_physio.tsv.gz',
        relativePath:
          '/sub-22/ses-1/func/sub-22_ses-2_task-rest_acq-prefrontal_physio.tsv.gz',
      },
      '3': {
        name:
          '/sub-25/ses-2/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
        path:
          'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-25/ses-2/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
        relativePath:
          'ds001//sub-25/ses-2/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
      },
    }
    const issues = BIDS.subIDsesIDmismatchtest(files)
    const code64_seen = issues.some(issue => issue.code == '64')
    const code65_seen = issues.some(issue => issue.code == '65')
    assert(code64_seen)
    assert(code65_seen)
  })
})
