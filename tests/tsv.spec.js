var assert = require('assert')
var validate = require('../index')

describe('TSV', function() {
  // general tsv checks ------------------------------------------------------------------

  var file = {
    name: 'sub-08_ses-test_task-­nback_physio.tsv.gz',
    relativePath:
      '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_events.tsv',
  }

  it('should not allow empty values saved as empty cells.', function() {
    var tsv = '1.0\t\t0.2\tresponse 1\t12.32'
    validate.TSV.TSV(file, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 23)
    })
  })

  it('should not allow missing values that are specified by something other than "n/a".', function() {
    var tsv = '1.0\tNA\t0.2\tresponse 1\t12.32'
    validate.TSV.TSV(file, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 24)
    })
  })

  it('should not allow different length rows', function() {
    var tsv =
      'header-one\theader-two\theader-three\n' +
      'value-one\tvalue-two\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(file, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 22)
    })
  })

  // events checks -----------------------------------------------------------------------

  var eventsFile = {
    name: 'sub-08_ses-test_task-linebisection_events.tsv',
    relativePath:
      '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_events.tsv',
  }

  it('should require events files to have "onset" as first header', function() {
    var tsv =
      'header-one\tduration\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(eventsFile, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 20)
    })
  })

  it('should require events files to have "duration" as second header', function() {
    var tsv =
      'onset\theader-two\theader-three\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(eventsFile, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 21)
    })
  })

  it('should not throw issues for a valid events file', function() {
    var tsv =
      'onset\tduration\theader-three\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(eventsFile, tsv, [], function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not throw issues for a valid events file with only two columns', function() {
    var tsv = 'onset\tduration\n' + 'value-one\tvalue-two'
    validate.TSV.TSV(eventsFile, tsv, [], function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should check for the presence of any stimulus files declared', function() {
    var tsv =
      'onset\tduration\tstim_file\n' +
      'value-one\tvalue-two\timages/red-square.jpg'
    var fileList = [{ relativePath: '/stimuli/images/blue-square.jpg' }]
    validate.TSV.TSV(eventsFile, tsv, fileList, function(issues) {
      assert(issues.length === 1 && issues[0].code === 52)
    })

    fileList.push({ relativePath: '/stimuli/images/red-square.jpg' })
    validate.TSV.TSV(eventsFile, tsv, fileList, function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should return all values in the stim_file column as a list', function() {
    var tsv =
      'onset\tduration\tstim_file\n' +
      'value-one\tvalue-two\timages/red-square.jpg'
    var fileList = [{ relativePath: '/stimuli/images/red-square.jpg' }]
    validate.TSV.TSV(eventsFile, tsv, fileList, function(
      issues,
      participants,
      stimFiles,
    ) {
      assert(
        stimFiles.length === 1 &&
          stimFiles[0] === '/stimuli/images/red-square.jpg',
      )
    })
  })

  // participants checks -----------------------------------------------------------------

  var participantsFile = {
    name: 'participants.tsv',
    relativePath: '/participants.tsv',
  }

  it('should not allow participants.tsv files without participant_id columns', function() {
    var tsv =
      'subject_id\theader-two\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(participantsFile, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 48)
    })
  })

  it('should allow a valid participants.tsv file', function() {
    var tsv =
      'participant_id\theader-two\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(participantsFile, tsv, [], function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow particpants with age 89 and above in participants.tsv file', function() {
    var tsv = 'participant_id\theader-two\tage\n' + 'sub-01\tvalue-two\t89'
    validate.TSV.TSV(participantsFile, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 56)
    })
  })

  // _scans checks -----------------------------------------------------------------

  var scansFile = {
    name: 'sub-08_ses-test_task-linebisection_scans.tsv',
    relativePath:
      '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_scans.tsv',
  }

  it('should not allow _scans.tsv files without filename column', function() {
    var tsv =
      'header-one\theader-two\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(scansFile, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 68)
    })
  })

  it('should allow _scans.tsv files with filename column', function() {
    var tsv =
      'header-one\tfilename\theader-three\n' +
      'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(scansFile, tsv, [], function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow improperly formatted acq_time column entries', function() {
    const tsv = 'filename\tacq_time\n' + 'value-one\t000001'
    validate.TSV.TSV(scansFile, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 84)
    })
  })

  it('should allow n/a as acq_time column entries', function() {
    const tsv = 'filename\tacq_time\n' + 'value-one\tn/a'
    validate.TSV.TSV(scansFile, tsv, [], function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should allow properly formatted acq_time column entries', function() {
    const tsv = 'filename\tacq_time\n' + 'value-one\t2017-05-03T06:45:45'
    validate.TSV.TSV(scansFile, tsv, [], function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should check participants listed in phenotype/*tsv and sub-ids ', function() {
    var phenotypeParticipants = [
      {
        list: ['10159', '10171', '10189'],
        file: {
          name: 'vmnm.tsv',
          path:
            '/corral-repl/utexas/poldracklab/openfmri/shared2/ds000030/ds030_R1.0.5/ds000030_R1.0.5//phenotype/vmnm.tsv',
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
      function(issues) {
        assert(issues.length === 1 && issues[0].code === 51)
      },
    )
  })

  // channels checks -----------------------------------------------------------------

  var channelsFileMEG = {
    name: 'sub-01_ses-meg_task-facerecognition_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-meg/meg/sub-01_ses-meg_task-facerecognition_run-01_channels.tsv',
  }

  it('should not allow MEG channels.tsv files without name column', function() {
    var tsv = 'header-one\ttype\tunits\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow MEG channels.tsv files without type column', function() {
    var tsv = 'name\theader-two\tunits\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow MEG channels.tsv files without units column', function() {
    var tsv = 'name\ttype\theader-three\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should allow MEG channels.tsv files with name, type and units columns', function() {
    var tsv =
      'name\ttype\tunits\theader-four\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four'
    validate.TSV.TSV(channelsFileMEG, tsv, [], function(issues) {
      assert(issues.length === 0)
    })
  })

  var channelsFileEEG = {
    name: 'sub-01_ses-001_task-rest_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_channels.tsv',
  }

  it('should not allow EEG channels.tsv files without name column', function() {
    var tsv = 'header-one\ttype\tunits\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow EEG channels.tsv files without type column', function() {
    var tsv = 'name\theader-two\tunits\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should not allow EEG channels.tsv files without units column', function() {
    var tsv = 'name\ttype\theader-three\n' + 'value-one\tvalue-two\tvalue-three'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 71)
    })
  })

  it('should allow EEG channels.tsv files with name, type and units columns', function() {
    var tsv =
      'name\ttype\tunits\theader-four\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four'
    validate.TSV.TSV(channelsFileEEG, tsv, [], function(issues) {
      assert(issues.length === 0)
    })
  })

  var channelsFileIEEG = {
    name: 'sub-01_ses-ieeg_task-facerecognition_run-01_channels.tsv',
    relativePath:
      '/sub-01/ses-ieeg/ieeg/sub-01_ses-meg_task-facerecognition_run-01_channels.tsv',
  }

  it('should not allow iEEG channels.tsv files without low_cutoff column', function() {
    var tsv =
      'name\ttype\tunits\textra-column\thigh_cutoff\n' +
      'value-name\tvalue-type\tvalue-units\tvalue-fake\tvalue-highcut'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 72)
    })
  })

  it('should not allow iEEG channels.tsv files without high_cutoff column', function() {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\textra-column\n' +
      'value-name\tvalue-type\tvalue-units\tvalue-lowcut\tvalue-fake'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 72)
    })
  })

  it('correct columns should pass for iEEG channels.tsv file', function() {
    var tsv =
      'name\ttype\tunits\tlow_cutoff\thigh_cutoff\n' +
      'value-name\tvalue-type\tvalue-units\tvalue-lowcut\tvalue-highcut'
    validate.TSV.TSV(channelsFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 0)
    })
  })

  // electrodes checks ---------------------------------------------------------
  var electrodesFileEEG = {
    name: 'sub-01_ses-001_task-rest_run-01_electrodes.tsv',
    relativePath:
      '/sub-01/ses-001/eeg/sub-01_ses-001_task-rest_run-01_electrodes.tsv',
  }

  it('should not allow EEG electrodes.tsv files without name column', function() {
    var tsv =
      'wrongcolumn\tx\ty\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('should not allow EEG electrodes.tsv files without x column', function() {
    var tsv =
      'name\twrongcolumn\ty\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('should not allow EEG electrodes.tsv files without y column', function() {
    var tsv =
      'name\tx\twrongcolumn\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('should not allow EEG electrodes.tsv files without z column', function() {
    var tsv =
      'name\tx\ty\twrongcolumn\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 96)
    })
  })

  it('correct columns should pass for EEG electrodes file', function() {
    var tsv =
      'name\tx\ty\tz\ttype\tmaterial\timpedance\n' +
      'valName\tvalX\tvalY\tvalZ\tvalType\tvalMaterial\tvalImpedance\n'
    validate.TSV.TSV(electrodesFileEEG, tsv, [], function(issues) {
      assert(issues.length === 0)
    })
  })

  var electrodesFileIEEG = {
    name: 'sub-01_ses-ieeg_task-facerecognition_run-01_electrodes.tsv',
    relativePath:
      '/sub-01/ses-ieeg/ieeg/sub-01_ses-ieeg_task-facerecognition_run-01_electrodes.tsv',
  }

  it('should not allow iEEG electrodes.tsv files without name column', function() {
    var tsv =
      'blah\tx\ty\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without x column', function() {
    var tsv =
      'name\tblah\ty\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without y column', function() {
    var tsv =
      'name\tx\tblah\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without z column', function() {
    var tsv =
      'name\tx\ty\tblah\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('should not allow iEEG electrodes.tsv files without size column', function() {
    var tsv =
      'name\tx\ty\tz\tblah\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 1 && issues[0].code === 73)
    })
  })

  it('correct columns should pass for iEEG electrodes file', function() {
    var tsv =
      'name\tx\ty\tz\tsize\ttype\n' +
      'value-one\tvalue-two\tvalue-three\tvalue-four\tvalue-five\tvalue-six\n'
    validate.TSV.TSV(electrodesFileIEEG, tsv, [], function(issues) {
      assert(issues.length === 0)
    })
  })
})
