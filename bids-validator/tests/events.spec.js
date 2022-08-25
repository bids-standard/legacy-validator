import assert from 'assert'
import validate from '../index'

describe('Events', function () {
  const headers = [
    [
      {
        path: '/sub01/sub01_task-test_bold.nii.gz',
        relativePath: '/sub01/sub01_task-test_bold.nii.gz',
      },
      { dim: [4, 0, 0, 0, 10] },
    ],
  ]

  it('all files in the /stimuli folder should be included in an _events.tsv file', () => {
    // stimuli.events will have all of the
    // files included in the stim_file column of every _events.tsv file.
    // stimuli.directory will have all of the
    // files included in the /stimuli directory.
    const stimuli = {
      events: ['/stimuli/images/red-square.jpg'],
      directory: [{ relativePath: '/stimuli/images/blue-square.jpg' }],
    }
    return validate.Events.validateEvents([], stimuli, [], {}).then(
      (issues) => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 77)
      },
    )
  })

  it('should not throw issues if all files in the /stimuli folder are included in an _events.tsv file', () => {
    const stimuli = {
      events: ['/stimuli/images/red-square.jpg'],
      directory: [{ relativePath: '/stimuli/images/red-square.jpg' }],
    }
    return validate.Events.validateEvents([], stimuli, [], {}, []).then(
      (issues) => {
        assert.deepStrictEqual(issues, [])
      },
    )
  })

  it('should throw an issue if the onset of the last event in _events.tsv is more than TR * number of volumes in corresponding nifti header', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: '12\tsomething\tsomething\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_bold.json': {
        RepetitionTime: 1,
      },
    }
    const jsonFiles = [
      {
        relativePath: '/sub01/sub01_task-test_events.json',
        path: '/sub01/sub01_task-test_events.json',
      },
    ]

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 85)
    })
  })

  it('should throw an issue if the onset of the last event in _events.tsv is less than .5 * TR * number of volumes in corresponding nifti header', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: '2\tsomething\tsomething\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_bold.json': {
        RepetitionTime: 1,
      },
    }
    const jsonFiles = [
      {
        relativePath: '/sub01/sub01_task-test_events.json',
        path: '/sub01/sub01_task-test_events.json',
      },
    ]

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 86)
    })
  })

  it('should not throw any issues if the onset of the last event in _events.tsv is a reasonable value', () => {
    const events = [
      {
        file: { path: '/sub01/sub01_task-test_events.tsv' },
        path: '/sub01/sub01_task-test_events.tsv',
        contents: '7\tsomething\tsomething\n',
      },
    ]
    const jsonDictionary = {
      '/sub01/sub01_task-test_bold.json': {
        RepetitionTime: 1,
      },
    }
    const jsonFiles = [
      {
        relativePath: '/sub01/sub01_task-test_events.json',
        path: '/sub01/sub01_task-test_events.json',
      },
    ]

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      jsonFiles,
      '',
    ).then((issues) => {
      assert.deepStrictEqual(issues, [])
    })
  })

  describe('HED event strings', () => {
    const jsonFiles = [
      {
        relativePath: '/sub01/sub01_task-test_events.json',
        path: '/sub01/sub01_task-test_events.json',
      },
      {
        relativePath: '/dataset_description.json',
        path: '/dataset_description.json',
      },
    ]

    it('should not throw an issue if the HED data is valid', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttest\tHED\n' +
            '7\tsomething\tone\tSpeed/30 mph\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          myCodes: {
            HED: {
              one: 'Duration/5 s',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '8.0.0' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        jsonFiles,
        '',
      ).then((issues) => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw an issue if a value column is annotated', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttest\tHED\n' + '7\t3.0\tone\tSpeed/30 mph\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          myCodes: {
            test: {
              HED: {
                one: 'Label/#',
              },
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '8.0.0' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        jsonFiles,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw an issue if a library schema is included', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttest\tHED\n' + '7\t3.0\tone\tSpeed/30 mph\n',
        },
      ]

      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          myCodes: {
            test: {
              HED: {
                one: 'ts:Sensory-presentation, Label/#',
              },
            },
          },
        },
        '/dataset_description.json': {
          HEDVersion: ['8.0.0', 'ts:testlib_1.0.2'],
        },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        jsonFiles,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should throw an issue if the HED data is invalid', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttest\tHED\n' +
            '7\tsomething\tone\tDuration/5 s\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          test: {
            HED: {
              one: 'Speed/5 ms',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '8.0.0' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        jsonFiles,
        '',
      ).then((issues) => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 104)
      })
    })

    it('should not throw an issue if multiple library schemas are included', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttest\tHED\n' + '7\t3.0\tone\tSpeed/30 mph\n',
        },
      ]

      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          myCodes: {
            test: {
              HED: {
                one: 'ts:Sensory-presentation, Label/#, sc:Sleep-deprivation',
              },
            },
          },
        },
        '/dataset_description.json': {
          HEDVersion: ['8.0.0', 'ts:testlib_1.0.2', 'sc:score_0.0.1'],
        },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        jsonFiles,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should properly issue warnings when appropriate', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttest\tHED\n' +
            '7\tsomething\tone\tHuman/Driver\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          test: {
            HED: {
              one: 'Train/Maglev',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '8.0.0' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        jsonFiles,
        '',
      ).then((issues) => {
        assert.strictEqual(issues.length, 2)
        assert.strictEqual(issues[0].code, 105)
        assert.strictEqual(issues[1].code, 105)
      })
    })
  })
})
