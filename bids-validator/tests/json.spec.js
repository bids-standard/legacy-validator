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

  it('*.json sidecars with CogPOID or CogAtlasID fields should require a uri format', function() {
    var jsonObj = {
      TaskName: 'rest',
      SamplingFrequency: 1000,
      EEGReference: 'Cz',
      SoftwareFilters: 'n/a',
      PowerLineFrequency: 1000,
      CogAtlasID:
        'we did a search on https://ww.idontexist.com for the word "atlas"',
    }
    jsonDict[eeg_file.relativePath] = jsonObj
    validate.JSON(eeg_file, jsonDict, function(issues) {
      assert(issues.length === 1)
      assert(issues[0].evidence == '.CogAtlasID should match format "uri"')
    })
  })

  it('*_eeg.json sidecars should have required key/value pairs', function() {
    var jsonObj = {
      TaskName: 'rest',
      SamplingFrequency: 1000,
      EEGReference: 'Cz',
      SoftwareFilters: {
        HighPass: { HalfAmplitudeCutOffHz: 1, RollOff: '6dB/Octave' },
      },
      PowerLineFrequency: 'n/a',
      CogPOID: 'https://www.idontexist.com',
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
      CogAtlasID: 'doi:thisisadoi',
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

  var meg_coordsystem_file = {
    name: 'sub-01/meg/sub-01_task-testing_coordsystem.json',
    relativePath: '/sub-01/meg/sub-01_task-testing_coordsystem.json',
  }

  it('MEG *_coordsystem.json files should have required key/value pairs', function() {
    var jsonObj = {
      FiducialsDescription: 'Fiducials were digitized using  ... ',
      MEGCoordinateSystem: 'CTF',
      MEGCoordinateUnits: 'mm',
      MEGCoordinateSystemDescription: 'this is the usual ...',
      EEGCoordinateSystem: 'CapTrak',
      EEGCoordinateSystemDescription: 'RAS orientation ...',
      HeadCoilCoordinateSystem: 'Other',
      HeadCoilCoordinates: {
        LPA: [-1, 0, 0],
        RPA: [1, 0, 0],
        NAS: [0, 1, 0],
      },
      AnatomicalLandmarkCoordinates: {
        LPA: [-1, 0, 0],
        RPA: [1, 0, 0],
        NAS: [0, 1, 0],
      },
      AnatomicalLandmarkCoordinateSystem: 'Other',
      AnatomicalLandmarkCoordinateUnits: 'mm',
    }
    jsonDict[meg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(meg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 4)
      assert(
        issues[0].evidence ==
          " should have required property 'HeadCoilCoordinateSystemDescription'",
      )
      assert(issues[1].evidence == ' should match "then" schema')
      assert(
        issues[2].evidence ==
          " should have required property 'AnatomicalLandmarkCoordinateSystemDescription'",
      )
      assert(issues[3].evidence == ' should match "then" schema')
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
      EEGCoordinateSystem: 'CapTrak',
      EEGCoordinateUnits: 'mm',
      EEGCoordinateSystemDescription: 'RAS orientation ...',
      AnatomicalLandmarkCoordinates: {
        LPA: [-1, 0, 0],
        RPA: [1, 0, 0],
        NAS: [0, 1, 0],
      },
      AnatomicalLandmarkCoordinateSystem: 'Other',
      AnatomicalLandmarkCoordinateUnits: 'mm',
      AnatomicalLandmarkCoordinateSystemDescription: '...',
    }
    jsonDict[eeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(eeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })

  it('EEG *_coordsystem.json files should not contain unaccepted *CoordinateSystem keywords', function() {
    var jsonObj = {
      EEGCoordinateSystem: 'RAS',
      EEGCoordinateUnits: 'mm',
      EEGCoordinateSystemDescription: 'RAS orientation ...',
    }
    jsonDict[eeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(eeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 5)
      assert(
        issues[0].evidence ==
          '.EEGCoordinateSystem should be equal to one of the allowed values',
      )
      assert(
        issues[4].evidence ==
          '.EEGCoordinateSystem should match some schema in anyOf',
      )
    })
  })

  it('EEG *_coordsystem.json schema should require *Description if *Coordsystem is "Other"', function() {
    var jsonObj = {
      EEGCoordinateSystem: 'Other',
      EEGCoordinateUnits: 'mm',
      EEGCoordinateSystemDescription: 'we did ...',
      FiducialsCoordinateSystem: 'Other',
      AnatomicalLandmarkCoordinateSystem: 'Other',
      AnatomicalLandmarkCoordinateSystemDescription: 'we did ...',
    }
    jsonDict[eeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(eeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 2)
      assert(
        issues[0].evidence ==
          " should have required property 'FiducialsCoordinateSystemDescription'",
      )
      assert(issues[1].evidence == ' should match "then" schema')
    })
  })

  it('EEG *_coordsystem.json schema general requirements should not be overridden by conditional requirements', function() {
    var jsonObj = {
      EEGCoordinateSystem: 'Other',
      EEGCoordinateSystemDescription: 'We used a ...',
      AnatomicalLandmarkCoordinateSystem: 'Other',
    }
    jsonDict[eeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(eeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 3)
      assert(
        issues[0].evidence ==
          " should have required property 'EEGCoordinateUnits'",
      )
      assert(
        issues[1].evidence ==
          " should have required property 'AnatomicalLandmarkCoordinateSystemDescription'",
      )
      assert(issues[2].evidence == ' should match "then" schema')
    })
  })

  var ieeg_coordsystem_file = {
    name: 'sub-01/ieeg/sub-01_task-testing_coordsystem.json',
    relativePath: '/sub-01/ieeg/sub-01_task-testing_coordsystem.json',
  }

  it('iEEG *_coordsystem.json files should have required key/value pairs', function() {
    var jsonObj = {
      iEEGCoordinateSystem: 'Pixels',
      iEEGCoordinateUnits: 'pixels',
    }
    jsonDict[ieeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(ieeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })

  it('If iEEG CoordinateSystem is "Pixels", then CoordinateUnits must be "pixels"', function() {
    var jsonObj = {
      iEEGCoordinateSystem: 'Pixels',
      iEEGCoordinateUnits: 'mm',
    }
    jsonDict[ieeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(ieeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 2)
      assert(
        issues[0].evidence ==
          '.iEEGCoordinateUnits should be equal to one of the allowed values',
      )
      assert(issues[1].evidence == ' should match "then" schema')
    })
  })

  it('iEEG *_coordsystem.json schema should require *Description if *Coordsystem is "Other"', function() {
    var jsonObj = {
      iEEGCoordinateSystem: 'Other',
      iEEGCoordinateUnits: 'pixels',
    }
    jsonDict[ieeg_coordsystem_file.relativePath] = jsonObj
    validate.JSON(ieeg_coordsystem_file, jsonDict, function(issues) {
      assert(issues.length === 2)
      assert(
        issues[0].evidence ==
          " should have required property 'iEEGCoordinateSystemDescription'",
      )
      assert(issues[1].evidence == ' should match "then" schema')
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

  it('dataset_description.json should validate DatasetLinks', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      DatasetLinks: {
        "mylink": "https://www.google.com"
      },
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })

  it('dataset_description.json should raise on empty key in DatasetLinks', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      DatasetLinks: {
        "mylink": "https://www.google.com",
        "": "https://www.yahoo.com"
      },
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 1)
      assert(issues[0].evidence==".DatasetLinks should NOT be valid")
    })
  })

  it('dataset_description.json should raise on wrong key in DatasetLinks', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      DatasetLinks: "https://www.google.com"
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 2)
      assert(issues[0].evidence==".DatasetLinks should be object")
      assert(issues[1].evidence==".DatasetLinks should NOT be valid")
    })
  })

  it('dataset_description.json should raise on invalid values in DatasetLinks', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      DatasetLinks: {
        "mylink1": "https://www.google.com",
        "mylink2": 1,
        "mylink3": "nope",
        "": "https://www.yahoo.com",
      },
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues[0].evidence==".DatasetLinks['mylink2'] should be string")
      assert(issues[1].evidence==".DatasetLinks['mylink3'] should match format \"uri\"")
      assert(issues[2].evidence==".DatasetLinks should NOT be valid")

    })
  })

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

  it('dataset_description.json should NOT validate with number in Authors', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      Authors: ['example author', 1],
      DatasetType: 'raw',
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

  it('dataset_description.json should validate with DatasetType "derivative" and GeneratedBy defined', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      Authors: ['example author'],
      DatasetType: 'derivative',
      GeneratedBy: [{ Name: 'Manual' }],
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })

  it('dataset_description.json should NOT validate with DatasetType "derivative" and GeneratedBy empty', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      Authors: ['example author'],
      DatasetType: 'derivative',
      GeneratedBy: [],
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 1)
      assert(
        issues[0].code == 55 &&
          issues[0].evidence ==
            '.GeneratedBy should NOT have fewer than 1 items',
      )
    })
  })

  it('dataset_description.json should NOT validate with DatasetType "derivative" and GeneratedBy missing', function() {
    var jsonObj = {
      Name: 'Example Name',
      BIDSVersion: '1.4.0',
      Authors: ['example author'],
      DatasetType: 'derivative',
    }
    jsonDict[dataset_description_file.relativePath] = jsonObj
    validate.JSON(dataset_description_file, jsonDict, function(issues) {
      assert(issues.length === 2)
      assert(
        issues[0].code == 55 &&
          issues[0].evidence == " should have required property 'GeneratedBy'",
      )
    })
  })

  var beh_file = {
    name: 'sub-01_run-01_beh.json',
    relativePath: '/sub-01_run-01_beh.json',
  }

  it('*beh.json sidecars with CogPOID or CogAtlasID fields should require a uri format', function() {
    var jsonObj = {
      TaskName: 'stroop',
      CogAtlasID:
        'we did a search on https://ww.idontexist.com for the word "atlas"',
      CogPOID:
        'we did a search on https://ww.idontexisteither.com for the word "paradigm"',
    }
    jsonDict[beh_file.relativePath] = jsonObj
    validate.JSON(beh_file, jsonDict, function(issues) {
      assert(issues.length === 2)
      assert(issues[0].evidence == '.CogAtlasID should match format "uri"')
      assert(issues[1].evidence == '.CogPOID should match format "uri"')
    })
  })

  it('*beh.json with extra content throws no error', function() {
    var jsonObj = {
      TaskName: 'stroop',
      trial: {
        LongName: 'Trial name',
        Description: 'Indicator of the type of trial',
        Levels: {
          congruent: 'Word and color font are congruent.',
          incongruent: 'Word and color font are not congruent.',
        },
      },
    }
    jsonDict[beh_file.relativePath] = jsonObj
    validate.JSON(beh_file, jsonDict, function(issues) {
      assert(issues.length === 0)
    })
  })
})
