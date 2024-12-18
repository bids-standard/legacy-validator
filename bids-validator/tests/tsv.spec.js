import assert from 'assert'
import validate from '../index'

describe('TSV', function () {
  // general tsv checks ------------------------------------------------------------------

  var file = {
    name: 'sub-08_ses-test_task-­nback_physio.tsv.gz',
    relativePath:
      '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_events.tsv',
  }

  it('should not allow empty values saved as empty cells.', function () {
    var tsv =
      'header-one\theader-two\theader-three\theader-four\theader-five\n' +
      '1.0\t\t0.2\tresponse 1\t12.32'
    validate.TSV.TSV(file, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 23)
    })
  })

  it('should not allow missing values that are specified by something other than "n/a".', function () {
    var tsv =
      'header-one\theader-two\theader-three\theader-four\theader-five\n' +
      'n1.0\tNA\t0.2\tresponse 1\t12.32'
    validate.TSV.TSV(file, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 24)
    })
  })

  it('should not allow different length rows', function () {
    var tsv =
      'header-one\theader-two\theader-three\n' +
      'value-one\tvalue-two\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(file, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 22)
    })
  })

  /* See utils.unit.validate for comment
  it('should not allow non-SI units', function () {
    var tsv =
      'header-one\tunits\theader-three\n' +
      'value-one\tµV\tvalue-three\n' +
      'value-one\tuV\tvalue-three'

    validate.TSV.TSV(file, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].key === 'INVALID_TSV_UNITS')
    })
  })
  */

  // events checks -----------------------------------------------------------------------

  var eventsFile = {
    name: 'sub-08_ses-test_task-linebisection_events.tsv',
    relativePath:
      '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_events.tsv',
  }

  it('should require events files to have "onset" as first header', function () {
    var tsv =
      'header-one\tduration\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 20)
    })
  })

  it('should require events files to have "duration" as second header', function () {
    var tsv =
      'onset\theader-two\theader-three\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 21)
    })
  })

  it('should not throw issues for a valid events file', function () {
    var tsv =
      'onset\tduration\theader-three\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not throw issues for a valid events file with only two columns', function () {
    var tsv = 'onset\tduration\n' + 'value-one\tvalue-two'
    validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should check for the presence of any stimulus files declared', function () {
    var tsv =
      'onset\tduration\tstim_file\n' +
      'value-one\tvalue-two\timages/red-square.jpg'
    var fileList = [{ relativePath: '/stimuli/images/blue-square.jpg' }]
    validate.TSV.TSV(eventsFile, tsv, fileList, function (issues) {
      assert(issues.length === 1 && issues[0].code === 52)
    })

    fileList.push({ relativePath: '/stimuli/images/red-square.jpg' })
    validate.TSV.TSV(eventsFile, tsv, fileList, function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should return all values in the stim_file column as a list', function () {
    var tsv =
      'onset\tduration\tstim_file\n' +
      'value-one\tvalue-two\timages/red-square.jpg'
    var fileList = [{ relativePath: '/stimuli/images/red-square.jpg' }]
    validate.TSV.TSV(
      eventsFile,
      tsv,
      fileList,
      function (issues, participants, stimFiles) {
        assert(
          stimFiles.length === 1 &&
            stimFiles[0] === '/stimuli/images/red-square.jpg',
        )
      },
    )
  })

  // participants checks -----------------------------------------------------------------

  var participantsFile = {
    name: 'participants.tsv',
    relativePath: '/participants.tsv',
  }

  it('should not allow participants.tsv files without participant_id columns', function () {
    var tsv =
      'subject_id\theader-two\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(participantsFile, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 48)
    })
  })

  it('should allow a valid participants.tsv file', function () {
    var tsv =
      'participant_id\theader-two\theader-three\n' +
      'sub-01\tvalue-two\tvalue-three'
    validate.TSV.TSV(participantsFile, tsv, [], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow participants with age 89 and above in participants.tsv file', function () {
    var tsv = 'participant_id\theader-two\tage\n' + 'sub-01\tvalue-two\t89'
    validate.TSV.TSV(participantsFile, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 56)
    })
  })

  it('should not allow participants written with incorrect pattern', function () {
    var tsv =
      'participant_id\theader-two\theader-three\n' +
      '01\tvalue-two\tvalue-three'
    validate.TSV.TSV(participantsFile, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 212)
    })
  })

  // _scans checks -----------------------------------------------------------------

  var scansFile = {
    name: 'sub-08_ses-test_task-linebisection_scans.tsv',
    relativePath:
      '/sub-08/ses-test/sub-08_ses-test_task-linebisection_scans.tsv',
  }

  var niftiFile = {
    name: 'sub-08_ses-test_task-linebisection_run-01_bold.nii.gz',
    relativePath:
      '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz',
  }

  var eegFile = {
    name: 'sub-08_ses-test_task-linebisection_run-01_eeg.fif',
    relativePath:
      '/sub-08/ses-test/eeg/sub-08_ses-test_task-linebisection_run-01_eeg.fif',
  }
  var ieegFile = {
    name: 'sub-08_ses-test_task-linebisection_run-01_ieeg.edf',
    relativePath:
      '/sub-08/ses-test/ieeg/sub-08_ses-test_task-linebisection_run-01_ieeg.edf',
  }

  var btiFiles = [
    {
      name: 'c,rf0.1Hz',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg/c,rf0.1Hz',
    },
    {
      name: 'config',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg/config',
    },
    {
      name: 'hs_file',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg/hs_file',
    },
  ]

  var ctfFiles = [
    {
      name: 'BadChannels',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/BadChannels',
    },
    {
      name: 'bad.segments',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/bad.segments',
    },
    {
      name: 'params.dsc',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/params.dsc',
    },
    {
      name: 'ClassFile.cls',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/ClassFile.cls',
    },
    {
      name: 'processing.cfg',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/processing.cfg',
    },
    {
      name: 'sub-08_ses-test_task-linebisection_acq-01_run-01_meg.res4',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/sub-01_ses-01_task-testing_acq-01_run-01_meg.res4',
    },
    {
      name: 'sub-08_ses-test_task-linebisection_acq-01_run-01_meg.hc',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/sub-01_ses-01_task-testing_acq-01_run-01_meg.hc',
    },
    {
      name: 'sub-08_ses-test_task-linebisection_acq-01_run-01_meg.infods',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/sub-01_ses-01_task-testing_acq-01_run-01_meg.infods',
    },
    {
      name: 'sub-08_ses-test_task-linebisection_acq-01_run-01_meg.acq',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/sub-01_ses-01_task-testing_acq-01_run-01_meg.acq',
    },
    {
      name: 'sub-08_ses-test_task-linebisection_acq-01_run-01_meg.newds',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/sub-01_ses-01_task-testing_acq-01_run-01_meg.newds',
    },
    {
      name: 'sub-08_ses-test_task-linebisection_acq-01_run-01_meg.meg4',
      relativePath:
        '/sub-08/ses-test/meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds/sub-01_ses-01_task-testing_acq-01_run-01_meg.meg4',
    },
  ]

  it('should not allow _scans.tsv files without filename column', function () {
    var tsv =
      'header-one\theader-two\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(scansFile, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 68)
    })
  })

  it('should allow _scans.tsv files with filename column', function () {
    var tsv =
      'header-one\tfilename\theader-three\n' +
      'value-one\tfunc/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\tvalue-three'
    validate.TSV.TSV(scansFile, tsv, [niftiFile], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow improperly formatted acq_time column entries', function () {
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t000001'
    validate.TSV.TSV(scansFile, tsv, [niftiFile], function (issues) {
      assert(issues.length === 1 && issues[0].code === 84)
    })
  })

  it('should allow n/a as acq_time column entries', function () {
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\tn/a'
    validate.TSV.TSV(scansFile, tsv, [niftiFile], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should allow properly formatted acq_time column entries', function () {
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45'
    validate.TSV.TSV(scansFile, tsv, [niftiFile], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should allow acq_time column entries with optional fractional seconds', function () {
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45.88288'
    validate.TSV.TSV(scansFile, tsv, [niftiFile], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should allow acq_time column entries with optional UTC specifier: "Z"', function () {
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45.88288Z'
    validate.TSV.TSV(scansFile, tsv, [niftiFile], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should allow session missing', function () {
    var niftiNoSesFile = {
      name: 'sub-08_task-linebisection_run-01_bold.nii.gz',
      relativePath: '/sub-08/func/sub-08_task-linebisection_run-01_bold.nii.gz',
    }
    var scansNoSesFile = {
      name: 'sub-08_task-linebisection_scans.tsv',
      relativePath: '/sub-08/sub-08_task-linebisection_scans.tsv',
    }
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45'
    validate.TSV.TSV(scansNoSesFile, tsv, [niftiNoSesFile], function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow mismatched filename entries', function () {
    const fileList = [eegFile]
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45'
    validate.TSV.TSV(scansFile, tsv, fileList, function (issues) {
      assert(issues.length === 1 && issues[0].code === 129)
    })
  })

  it('should allow matching filename entries', function () {
    const fileList = [niftiFile, eegFile, ieegFile]
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45\n' +
      'eeg/sub-08_ses-test_task-linebisection_run-01_eeg.fif\t2017-05-03T06:45:45\n' +
      'ieeg/sub-08_ses-test_task-linebisection_run-01_ieeg.edf\t2017-05-03T06:45:45'
    validate.TSV.TSV(scansFile, tsv, fileList, function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should allow matching filename entries for CTF and BTI data', function () {
    const fileList = btiFiles.concat(ctfFiles)
    const tsv =
      'filename\tacq_time\n' +
      'meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg\t2017-05-03T06:45:45\n' +
      'meg/sub-08_ses-test_task-linebisection_acq-01_run-01_meg.ds\t2017-05-03T06:45:45'
    validate.TSV.TSV(scansFile, tsv, fileList, function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should check participants listed in phenotype/*tsv and sub-ids ', function () {
    var phenotypeParticipants = [
      {
        list: ['10159', '10171', '10189'],
        file: {
          name: 'vmnm.tsv',
          path: '/corral-repl/utexas/poldracklab/openfmri/shared2/ds000030/ds030_R1.0.5/ds000030_R1.0.5//phenotype/vmnm.tsv',
          relativePath: '/phenotype/vmnm.tsv',
        },
      },
    ]
    var summary = {
      sessions: [],
      subjects: ['10159', '10171'],
      tasks: [],
      totalFiles: 43,
      size: 11845,
    }
    var issues = []
    validate.TSV.checkPhenotype(
      phenotypeParticipants,
      summary,
      issues,
      function (issues) {
        assert(issues.length === 1 && issues[0].code === 51)
      },
    )
  })

  it('should ignore files in scans.tsv that correspond to entries in .bidsignore', function () {
    sessionStorage.clear()
    sessionStorage.setItem('bidsignoreContent', JSON.stringify('sodium/'))
    const fileList = [niftiFile, eegFile, ieegFile]
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45\n' +
      'eeg/sub-08_ses-test_task-linebisection_run-01_eeg.fif\t2017-05-03T06:45:45\n' +
      'ieeg/sub-08_ses-test_task-linebisection_run-01_ieeg.edf\t2017-05-03T06:45:45\n' +
      'sodium/sub-08_acq-23Na_echo-01.nii.gz\t2018-04-26T21:30:00'
    validate.TSV.TSV(scansFile, tsv, fileList, function (issues) {
      assert.deepEqual(issues, [])
    })
    sessionStorage.removeItem('bidsignoreContent')
  })

  it('should not allow missing files listed in scans.tsv and not accounted for by .bidsignore', function () {
    sessionStorage.clear()
    sessionStorage.setItem('bidsignoreContent', JSON.stringify('sodium/'))
    const fileList = [niftiFile, eegFile]
    const tsv =
      'filename\tacq_time\n' +
      'func/sub-08_ses-test_task-linebisection_run-01_bold.nii.gz\t2017-05-03T06:45:45\n' +
      'eeg/sub-08_ses-test_task-linebisection_run-01_eeg.fif\t2017-05-03T06:45:45\n' +
      'ieeg/sub-08_ses-test_task-linebisection_run-01_ieeg.edf\t2017-05-03T06:45:45\n' +
      'sodium/sub-08_acq-23Na_echo-01.nii.gz\t2018-04-26T21:30:00'
    validate.TSV.TSV(scansFile, tsv, fileList, function (issues) {
      assert(issues.length === 1 && issues[0].code === 129)
    })
    sessionStorage.removeItem('bidsignoreContent')
  })

  // channels checks -----------------------------------------------------------------

  var channelsFileMEG = {
    name: 'sub-01_ses-meg_task-facerecognition_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-meg/meg/sub-01_ses-meg_task-facerecognition_run-01_channels.tsv',
  }

  it('should not allow MEG channels.tsv files without name column', function () {
    var tsv = 'header-one\ttype\tunits\n' + 'value-one\tEEG\tmV'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow MEG channels.tsv files without type column', function () {
    var tsv = 'name\theader-two\tunits\n' + 'value-one\tEEG\tmV'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow MEG channels.tsv files without units column', function () {
    var tsv = 'name\ttype\theader-three\n' + 'value-one\tEEG\tvalue-three'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should allow MEG channels.tsv files with name, type and units columns', function () {
    var tsv =
      'name\ttype\tunits\theader-four\n' + 'value-one\tEEG\tmV\tvalue-four'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  var channelsFileEEG = {
    name: 'sub-01_ses-001_task-rest_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_channels.tsv',
  }

  it('should not allow EEG channels.tsv files without name column', function () {
    var tsv = 'header-one\ttype\tunits\n' + 'value-one\tEEG\tmV'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow EEG channels.tsv files with name column in wrong place', function () {
    var tsv =
      'header-one\ttype\tunits\tname\n' + 'value-one\tEEG\tmV\tvalue-name'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 230)
    })
  })

  it('should not allow EEG channels.tsv files without type column', function () {
    var tsv = 'name\theader-two\tunits\n' + 'value-one\tEEG\tmV'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow EEG channels.tsv files without units column', function () {
    var tsv = 'name\ttype\theader-three\n' + 'value-one\tEEG\tvalue-three'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should allow EEG channels.tsv files with name, type and units columns', function () {
    var tsv =
      'name\ttype\tunits\theader-four\n' + 'value-one\tEEG\tmV\tvalue-four'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  var channelsFileIEEG = {
    name: 'sub-01_ses-ieeg_task-facerecognition_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-ieeg/ieeg/sub-01_ses-meg_task-facerecognition_run-01_channels.tsv',
  }

  it('should not allow iEEG channels.tsv files without low_cutoff column', function () {
    var tsv =
      'name\ttype\tunits\textra-column\thigh_cutoff\n' +
      'value-name\tECOG\tmV\tvalue-fake\tvalue-highcut'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 72)
    })
  })

  it('should not allow iEEG channels.tsv files with low_cutoff column in wrong place', function () {
    var tsv =
      'name\ttype\tunits\thigh_cutoff\tlow_cutoff\n' +
      'value-name\tECOG\tmV\tvalue-highcut\tvalue-lowcut'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function (issues) {
      assert(
        issues.length === 2 && issues[0].code === 229 && issues[1].code === 229,
      )
    })
  })

  it('should not allow iEEG channels.tsv files without high_cutoff column', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\textra-column\n' +
      'value-name\tECOG\tmV\tvalue-lowcut\tvalue-fake'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 72)
    })
  })

  it('should not allow iEEG channels.tsv files with value other than good/bad in status column', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\tECOG\tmV\tvalue-lowcut\tvalue-highcut\tnot-good'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 125)
    })
  })

  it('correct columns should pass for iEEG channels.tsv file', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\tECOG\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  it('should not allow iEEG channels.tsv files with value other than accepted values in type column', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\tMEEG\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 131)
      expect(typeof issues[0].evidence).toBe('string')
    })
  })

  it('should return a string value for evidence for issue 130', function () {
    const tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\teeg\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 130)
      expect(typeof issues[0].evidence).toBe('string')
    })
  })

  it('should return a string value for evidence for issue 131', function () {
    const tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\tMEEG\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 131)
      expect(typeof issues[0].evidence).toBe('string')
    })
  })

  it('should not allow EEG channels.tsv files with value other than accepted values in type column', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\tMEEG\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 131)
    })
  })

  it('should not allow MEG channels.tsv files with value other than accepted values in type column', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\tMEEG\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 131)
    })
  })

  it('should not allow channels.tsv files with lower-casing in type column', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\teeg\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 130)
    })
  })

  it('should allow iEEG channels.tsv files with accepted values in type column', function () {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\tstatus\n' +
      'value-name\tECOG\tmV\tvalue-lowcut\tvalue-highcut\tgood'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })
  var channelsFileNIRS = {
    name: 'sub-01_ses-001_task-rest_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-001/nirs/sub-01_ses-001_task-rest_run-01_channels.tsv',
  }

  it('NIRS channels.tsv with correct columns should throw no error', function () {
    var tsv =
      'name\ttype\tsource\tdetector\twavelength_nominal\tunits\n' +
      'testch\tNIRSCWAMPLITUDE\tS1\tD1\t760.0\tV'
    validate.TSV.TSV(channelsFileNIRS, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  it('should not allow NIRS channels.tsv files without name column', function () {
    var tsv =
      'type\tsource\tdetector\twavelength_nominal\tunits\n' +
      'NIRSCWAMPLITUDE\tS1\tD1\t760.0\tV'
    validate.TSV.TSV(channelsFileNIRS, tsv, [], function (issues) {
      assert(issues[0].code === 234)
    })
  })

  var channelsFileMOTION = {
    name: 'sub-01_ses-walk_task-navigation_tracksys-IMU1_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-walk/motion/sub-01_ses-walk_task-navigation_tracksys-IMU1_run-01_channels.tsv',
  }

  it('MOTION channels.tsv with correct columns should throw no error', function () {
    var tsv =
      'name\tcomponent\ttype\ttracked_point\tunits\n' +
      't1_acc_x\tx\tACCEL\tLeftFoot\tm/s^2'
    validate.TSV.TSV(channelsFileMOTION, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  it('should not allow MOTION channels.tsv files without component column', function () {
    var tsv =
      'name\ttype\ttracked_point\tunits\n' + 't1_acc_x\tACCEL\tLeftFoot\tm/s^2'
    validate.TSV.TSV(channelsFileMOTION, tsv, [], function (issues) {
      assert(issues[0].code === 129)
    })
  })

  // optodes checks ---------------------------------------------------------
  var optodesFileNIRS = {
    name: 'sub-01_ses-001_task-rest_run-01_optodes.tsv',
    relativePath:
      '/sub-01/ses-001/nirs/sub-01_ses-001_task-rest_run-01_optodes.tsv',
  }

  it('should allow NIRS optodes.tsv files with correct columns', function () {
    var tsv = 'name\ttype\tx\ty\tz\n' + 'S1\tsource\t-0.04\t0.02\t0.5\n'
    validate.TSV.TSV(optodesFileNIRS, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  it('should not allow NIRS optodes.tsv files with out name columns', function () {
    var tsv = 'type\tx\ty\tz\n' + 'source\t-0.04\t0.02\t0.5\n'
    validate.TSV.TSV(optodesFileNIRS, tsv, [], function (issues) {
      assert(issues[0].code === 233)
    })
  })

  // electrodes checks ---------------------------------------------------------
  var electrodesFileEEG = {
    name: 'sub-01_ses-001_task-rest_run-01_electrodes.tsv',
    relativePath:
      '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_electrodes.tsv',
  }

  it('should not allow EEG electrodes.tsv files without name column', function () {
    var tsv =
      'wrongcolumn\tx\ty\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('should not allow EEG electrodes.tsv files without x column', function () {
    var tsv =
      'name\twrongcolumn\ty\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('should not allow EEG electrodes.tsv files without y column', function () {
    var tsv =
      'name\tx\twrongcolumn\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('should not allow EEG electrodes.tsv files without z column', function () {
    var tsv =
      'name\tx\ty\twrongcolumn\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('correct columns should pass for EEG electrodes file', function () {
    var tsv =
      'name\tx\ty\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  var electrodesFileIEEG = {
    name: 'sub-01_ses-ieeg_task-facerecognition_run-01_electrodes.tsv',
    relativePath:
      '/sub-01/ses-ieeg/ieeg/sub-01_ses-ieeg_task-facerecognition_run-01_electrodes.tsv',
  }

  it('should not allow iEEG electrodes.tsv files without name column', function () {
    var tsv =
      'blah\tx\ty\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without x column', function () {
    var tsv =
      'name\tblah\ty\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without y column', function () {
    var tsv =
      'name\tx\tblah\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without z column', function () {
    var tsv =
      'name\tx\ty\tblah\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without size column', function () {
    var tsv =
      'name\tx\ty\tz\tblah\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('correct columns should pass for iEEG electrodes file', function () {
    var tsv =
      'name\tx\ty\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function (issues) {
      assert(issues.length === 0)
    })
  })

  var physio_file = {
    name: 'sub-20_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
    relativePath:
      '/sub-20/ses-1/func/sub-20_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
  }

  it('should not allow physio.tsv.gz file without some associated json', function () {
    let issues = validate.TSV.validateContRec([physio_file], {})
    assert(issues.length === 1 && issues[0].code === 170)
  })

  // samples checks -----------------------------------------------------------

  const samplesFile = {
    name: 'samples.tsv',
    relativePath: '/samples.tsv',
  }

  it('should return errors for each missing mandatory header in samples.tsv', () => {
    const tsv = 'wrong_col\nsome_data\n'
    validate.TSV.TSV(samplesFile, tsv, [], function (issues) {
      expect(issues.length).toBe(3)
      const codes = issues.map((x) => x.code)
      expect(codes.includes(216)).toBe(true)
      expect(codes.includes(217)).toBe(true)
      expect(codes.includes(218)).toBe(true)
    })
  })

  it('should return an error for invalid sample_type samples.tsv', () => {
    const tsv = 'sample_type\nbad\n'
    validate.TSV.TSV(samplesFile, tsv, [], function (issues) {
      const codes = issues.map((x) => x.code)
      expect(codes.includes(219)).toBe(true)
    })
  })
})
