import assert from 'assert'
import validate from '../index'

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
      EEGReference: 'Cz',
      SoftwareFilters: {
        HighPass: { HalfAmplitudeCutOffHz: 1, RollOff: '6dB/Octave' },
      },
      PowerLineFrequency: 'n/a',
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

  var eeg_coordsystem_file = {
    name: 'sub-01/eeg/sub-01_task-testing_coordsystem.json',
    relativePath: '/sub-01/eeg/sub-01_task-testing_coordsystem.json',
  }

  it('EEG *_coordsystem.json files should have required key/value pairs', function() {
    var jsonObj = {
      IntendedFor: 'sub-01_task-testing_electrodes.tsv',
      FiducialsDescription: 'Fiducials were digitized using  ... ',
      EEGCoordinateSystem: 'Captrack',
      EEGCoordinateUnits: 'mm',
      EEGCoordinateSystemDescription: 'RAS orientation ...',
      AnatomicalLandmarkCoordinates: {
        LPA: [-1, 0, 0],
        RPA: [1, 0, 0],
        NAS: [0, 1, 0],
      },
      AnatomicalLandmarkCoordinateSystem: '...',
      AnatomicalLandmarkCoordinateUnits: '...',
      AnatomicalLandmarkCoordinateSystemDescription: '...',
    }
    jsonDict[eeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(eeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })

  var ieeg_coordsystem_file = {
    name: 'sub-01/ieeg/sub-01_task-testing_coordsystem.json',
    relativePath: '/sub-01/ieeg/sub-01_task-testing_coordsystem.json',
  }

  it('iEEG *_coordsystem.json files should have required key/value pairs', function() {
    var jsonObj = {
      iEEGCoordinateSystem: 'Other',
      iEEGCoordinateUnits: 'mm',
    }
    jsonDict[ieeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(ieeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 0)
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

  var genetic_info_file = {
    name: 'genetic_info.json',
    relativePath: '/genetic_info.json',
  }

  it('sample genetic_info.json should parse', function() {
    var jsonObj = {
      GeneticLevel: ['Genetic'],
      AnalyticalApproach: ['SNP Genotypes'],
      SampleOrigin: 'brain',
      TissueOrigin: 'gray matter',
      CellType: 'neuron',
      BrainLocation: '[-30 -15 10]',
    }
    jsonDict[genetic_info_file.relativePath] = jsonObj
    validate.JSON(genetic_info_file, jsonDict, function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('genetic_info.json should use limited vocabulary for sample origin', function() {
    var jsonObj = {
      GeneticLevel: ['Genetic'],
      AnalyticalApproach: ['SNP Genotypes'],
      SampleOrigin: 'not_from_around_here',
      TissueOrigin: 'gray matter',
      CellType: 'neuron',
      BrainLocation: '[-30 -15 10]',
    }
    jsonDict[genetic_info_file.relativePath] = jsonObj
    validate.JSON(genetic_info_file, jsonDict, function(issues) {
      assert(issues.length === 1 && issues[0].code == 55)
    })
  })

  var dataset_description_file = {
    name: 'dataset_description.json',
    relativePath: '/dataset_description.json',
  }

  it('dataset_description.json should validate with enum of DatasetType', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      Authors: ['example author'],
      DatasetType: 'raw',
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })

  it('dataset_description.json should NOT validate with wrong enum of DatasetType', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      Authors: ['example author'],
      DatasetType: 'badenum',
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 1 && issues[0].code == 55)
    })
  })

  it('dataset_description.json should validate with only required fields, no recommended', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })
})
