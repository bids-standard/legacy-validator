var assert = require('assert')
var validate = require('../index')

describe('JSON', function() {
  var file = {
    name: 'task-rest_bold.json',
    relativePath: '/task-rest_bold.json',
  }
  var jsonDict = {}

  it('sidecars should have key/value pair for "RepetitionTime" expressed in seconds', function() {
    var jsonObj = {
      RepetitionTime: 1.2,
      echo_time: 0.005,
      flip_angle: 90,
      TaskName: 'Rest',
    }
    jsonDict[file.relativePath] = jsonObj
    validate.JSON(file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
    var jsonObjInval = {
      RepetitionTime: 1200,
      echo_time: 0.005,
      flip_angle: 90,
      TaskName: 'Rest',
    }
    jsonDict[file.relativePath] = jsonObjInval
    validate.JSON(file, jsonDict, function(issues) {
      assert(issues && issues.length === 1)
    })
  })

  it('should detect negative value for SliceTiming', function() {
    var jsonObj = {
      RepetitionTime: 1.2,
      SliceTiming: [-1.0, 0.0, 1.0],
      TaskName: 'Rest',
    }
    jsonDict[file.relativePath] = jsonObj
    validate.JSON(file, jsonDict, function(issues) {
      assert(issues.length === 1 && issues[0].code == 55)
    })
  })

  var meg_file = {
    name: 'sub-01_run-01_meg.json',
    relativePath: '/sub-01_run-01_meg.json',
  }

  it('*_meg.json sidecars should have required key/value pairs', function() {
    var jsonObj = {
      TaskName: 'Audiovis',
      SamplingFrequency: 1000,
      PowerLineFrequency: 50,
      DewarPosition: 'Upright',
      SoftwareFilters: 'n/a',
      DigitizedLandmarks: true,
      DigitizedHeadPoints: false,
    }
    jsonDict[meg_file.relativePath] = jsonObj
    validate.JSON(meg_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })

    var jsonObjInval = jsonObj
    jsonObjInval['SamplingFrequency'] = ''
    jsonDict[meg_file.relativePath] = jsonObjInval
    validate.JSON(meg_file, jsonDict, function(issues) {
      assert(issues && issues.length === 1)
    })
  })

  var eeg_file = {
    name: 'sub-01_run-01_eeg.json',
    relativePath: '/sub-01_run-01_eeg.json',
  }

  it('*_eeg.json sidecars should have required key/value pairs', function() {
    var jsonObj = {
      TaskName: 'rest',
      SamplingFrequency: 1000,
      EEGChannelCount: 1,
      EOGChannelCount: 2,
      ECGChannelCount: 3,
      EMGChannelCount: 4,
      EEGReference: 'Cz',
      PowerLineFrequency: 50,
    }
    jsonDict[eeg_file.relativePath] = jsonObj
    validate.JSON(eeg_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })

    var jsonObjInval = jsonObj
    jsonObjInval['SamplingFrequency'] = ''
    jsonDict[eeg_file.relativePath] = jsonObjInval
    validate.JSON(eeg_file, jsonDict, function(issues) {
      assert(issues && issues[0].code == 55)
    })
  })

  var ieeg_file = {
    name: 'sub-01_run-01_ieeg.json',
    relativePath: '/sub-01_run-01_ieeg.json',
  }

  it('*_ieeg.json sidecars should have required key/value pairs', function() {
    var jsonObj = {
      TaskName: 'Audiovis',
      SamplingFrequency: 10,
      PowerLineFrequency: 50,
      SoftwareFilters: {
        HighPass: { HalfAmplitudeCutOffHz: 1, RollOff: '6dB/Octave' },
      },
      iEEGReference: 'chan1',
    }
    jsonDict[ieeg_file.relativePath] = jsonObj
    validate.JSON(ieeg_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
    var jsonObjInval = jsonObj
    jsonObjInval['Manufacturer'] = ''
    jsonDict[ieeg_file.relativePath] = jsonObjInval
    validate.JSON(ieeg_file, jsonDict, function(issues) {
      assert(issues && issues.length === 1)
    })
  })

  it('should use inherited sidecars to find missing fields', function() {
    const multiEntryJsonDict = {}

    // this json file is missing the SamplingFrequency field
    const partialJsonObj = {
      TaskName: 'Audiovis',
      PowerLineFrequency: 50,
      DewarPosition: 'Upright',
      SoftwareFilters: 'n/a',
      DigitizedLandmarks: true,
      DigitizedHeadPoints: false,
    }
    multiEntryJsonDict[meg_file.relativePath] = partialJsonObj

    // this json file (sitting at the root directory level)
    // provides the missing json field
    const inheritedMegFile = {
      name: 'meg.json',
      relativePath: '/meg.json',
    }

    const restOfJsonObj = {
      SamplingFrequency: 2000,
    }
    multiEntryJsonDict[inheritedMegFile.relativePath] = restOfJsonObj

    // json validation will pass because (when merged) there are no
    // missing data fields
    validate.JSON(meg_file, multiEntryJsonDict, function(issues) {
      assert(issues.length == 0)
    })
  })

  it('should favor the sidecar on the directory level closest to the file being validated', function() {
    const multiEntryJsonDict = {}
    const lowLevelFile = {
      name: 'run-01_meg.json',
      relativePath: '/sub-01/run-01_meg.json',
    }

    // this json file has a good SamplingFrequency field
    const partialJsonObj = {
      TaskName: 'Audiovis',
      SamplingFrequency: 1000,
      PowerLineFrequency: 50,
      DewarPosition: 'Upright',
      SoftwareFilters: 'n/a',
      DigitizedLandmarks: true,
      DigitizedHeadPoints: false,
    }
    multiEntryJsonDict[lowLevelFile.relativePath] = partialJsonObj

    // this json file (sitting at the root directory level)
    // also has a SamplingFrequency field, but it is wrong.
    const inheritedMegFile = {
      name: 'meg.json',
      relativePath: '/meg.json',
    }

    const restOfJsonObj = {
      SamplingFrequency: '',
    }
    multiEntryJsonDict[inheritedMegFile.relativePath] = restOfJsonObj

    // json validation will pass because merged dictionaries prefer
    // field values of the json sidecar furthest from the root.
    // /meg.json is closer to the root than /sub-01/run-01_meg.json
    // and so the values of the latter should be preferred.
    validate.JSON(lowLevelFile, multiEntryJsonDict, function(issues) {
      assert(issues.length == 0)
    })
  })

  it('*_bold.json sidecars should not have EffectiveEchoSpacing > TotalReadoutTime', () => {
    // this json dictionary generates a sidecar with EffectiveEchoSpacing > TotalReadoutTime,
    // which is nonsensical
    const fieldMapJsonDict = {
      EffectiveEchoSpacing: 3,
      TotalReadoutTime: 1,
    }
    jsonDict[file.relativePath] = fieldMapJsonDict

    // validation should return an error of code 93
    validate.JSON(file, jsonDict, issues => {
      assert(issues.length == 1 && issues[0].code == '93')
    })
  })

  it('*_bold.json sidecars should have EffectiveEchoSpacing < TotalReadoutTime', () => {
    // this json dictionary generates a sidecar with EffectiveEchoSpacing < TotalReadoutTime,
    // which is reasonable
    const fieldMapJsonDict = {
      EffectiveEchoSpacing: 3,
      TotalReadoutTime: 5,
    }
    jsonDict[file.relativePath] = fieldMapJsonDict

    // validation should pass with no errors.
    validate.JSON(file, jsonDict, issues => {
      assert.deepEqual(issues, [])
    })
  })
})
