import assert from 'assert'
import validate from '../index'

describe('Events', function() {
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
    return validate.Events.validateEvents([], stimuli, [], {}).then(issues => {
      assert.strictEqual(issues.length, 1)
      assert.strictEqual(issues[0].code, 77)
    })
  })

  it('should not throw issues if all files in the /stimuli folder are included in an _events.tsv file', () => {
    const stimuli = {
      events: ['/stimuli/images/red-square.jpg'],
      directory: [{ relativePath: '/stimuli/images/red-square.jpg' }],
    }
    return validate.Events.validateEvents([], stimuli, [], {}).then(issues => {
      assert.deepStrictEqual(issues, [])
    })
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

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      '',
    ).then(issues => {
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

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      '',
    ).then(issues => {
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

    return validate.Events.validateEvents(
      events,
      [],
      headers,
      jsonDictionary,
      '',
    ).then(issues => {
      assert.deepStrictEqual(issues, [])
    })
  })

  describe('HED event strings', function() {
    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of duplicate tags', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 110)
      })
    })

    it('should not throw any issues if the HED column in a single row contains valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw any issues if the HED column in a single row contains valid HED data in multiple levels', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Item/Object/Vehicle/Train,(Item/Object/Vehicle/Train,Event/Category/Experimental stimulus)\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw any issues if the HED column in multiple rows contains valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n' +
            '8\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should throw an issue if the HED columns in a single row, including sidecars, contain invalid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\tmycodes\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\tfirst\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          mycodes: {
            HED: {
              first: 'Event/Category/Miscellaneous/Test',
              second: '/Action/Reach/To touch',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 110)
      })
    })

    it('should not throw any issues if the HED columns in a single row, including sidecars, contain valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\tmycodes\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\tsecond\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          mycodes: {
            HED: {
              first: 'Event/Category/Miscellaneous/Test',
              second: '/Action/Reach/To touch',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw any issues if the HED columns in multiple rows, including sidecars, contain valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\tmycodes\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\tsecond\n' +
            '7\tsomething\t/Action/Reach/To touch\tfirst\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          mycodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second: '/Action/Reach/To touch',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should throw an issue if a single sidecar HED column in a single row contains invalid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tmycodes\n' + '7\tsomething\tfirst\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          mycodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 110)
      })
    })

    it('should not throw any issues if a single sidecar HED column in a single row contains valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tmycodes\n' + '7\tsomething\tsecond\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          mycodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw any issues if a single sidecar HED column in multiple rows contains valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tmycodes\n' +
            '7\tsomething\tsecond\n' +
            '8\tsomething\tsecond',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          mycodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should throw an issue if any sidecar HED columns in a single row contain invalid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttestingCodes\tmyCodes\n' +
            '7\tsomething\tfirst\tone\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          testingCodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
          myCodes: {
            HED: {
              one: 'Event/Category/Miscellaneous/Test',
              two: '/Action/Reach/To touch',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 110)
      })
    })

    it('should not throw an issue if all sidecar HED columns in a single row contain valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttestingCodes\tmyCodes\n' +
            '7\tsomething\tfirst\ttwo\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          testingCodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
          myCodes: {
            HED: {
              one: 'Event/Category/Miscellaneous/Test',
              two: '/Action/Reach/To touch',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw an issue if all sidecar HED columns in multiple rows contain valid HED data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttestingCodes\tmyCodes\n' +
            '7\tsomething\tfirst\ttwo\n' +
            '8\tsomething\tsecond\tone\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          testingCodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
          myCodes: {
            HED: {
              one: '/Action/Reach/To touch',
              two: '/Action/Reach/To touch',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should throw an issue if a sidecar HED column in a single row contains a non-existent key', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tmycodes\n' + '7\tsomething\tthird\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          mycodes: {
            HED: {
              first: 'Event/Category/Experimental stimulus',
              second: '/Action/Reach/To touch',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 112)
      })
    })

    it('should not throw an issue if all sidecar HED columns in a single row contain valid HED value data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttestingCodes\tmyValue\n' +
            '7\tsomething\tfirst\tRed\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          testingCodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
          myValue: {
            HED: 'Attribute/Visual/Color/#,Item/Object/Vehicle/Bicycle',
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw an issue if all sidecar HED columns in multiple rows contain valid HED value data', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttestingCodes\tmyValue\n' +
            '7\tsomething\tfirst\tRed\n' +
            '8\tsomething\tsecond\tBlue\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          testingCodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
          myCodes: {
            HED: 'Attribute/Visual/Color/#,Item/Object/Vehicle/Bicycle',
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should throw an issue if a sidecar HED value column has no number signs', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttestingCodes\tmyValue\n' +
            '7\tsomething\tfirst\tRed\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          testingCodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
          myValue: {
            HED: 'Attribute/Visual/Color/Red,Item/Object/Vehicle/Bicycle',
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 134)
      })
    })

    it('should throw an issue if a sidecar HED value column has too many number signs', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\ttestingCodes\tmyValue\n' +
            '7\tsomething\tfirst\tRed\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          testingCodes: {
            HED: {
              first:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
              second:
                'Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test',
            },
          },
          myValue: {
            HED: 'Attribute/Visual/Color/#,Item/Object/Vehicle/#',
          },
        },
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 134)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of an illegal character', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test]\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 106)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of mismatched parentheses', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\t(Event/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 107)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of a missing comma after a tag', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,/Action/Reach/To touch,(/Attribute/Object side/Left,/Participant/Effect/Body part/Arm)/Attribute/Location/Screen/Top/70 px,/Attribute/Location/Screen/Left/23 px\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 108)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of improper capitalization', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/label/test,Event/Category/Miscellaneous/Test,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 109)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of too many tildes in a single group', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,(Participant/ID/1 ~ Participant/Effect/Visual ~ Item/Object/Vehicle/Car, Item/ID/RedCar, Attribute/Visual/Color/Red ~ Attribute/Object control/Perturb)\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 111)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of an extra delimiter', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/label/Test,Event/Category/Miscellaneous/Test~,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 115)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of an invalid tag', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Item/Object/Person/Cyclist,Event/Something\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 116)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of a tag extension', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Item/Object/Person/Driver\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 140)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of a duplicate unique tag', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Event/Description/Bad\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 117)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of a tag with a missing required child', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 118)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of a missing required prefix', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Category/Miscellaneous/Test,Event/Description/Test\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 119)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of a value tag with an implied default unit', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Event/Duration/3\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 120)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of a value tag with an invalid unit', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Event/Duration/3 cm\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 121)
      })
    })

    it('should throw an issue if the HED column in a single row contains invalid HED data in the form of an invalid tag or an extra comma', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,This/Is/A/Tag\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.1.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 122)
      })
    })

    it('should not throw an issue if the HED string is valid in a previous remote schema version', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tEvent/Label/Test,Event/Category/Miscellaneous/Test,Event/Description/Test,Event/Duration/3 ms\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '7.0.5' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw an issue if the HED string is a valid short-form tag', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tHED\n' + '7\tsomething\tDuration/3 ms\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should not throw an issue if a sidecar HED string is a valid short-form tag', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tmyCodes\n' + '7\tsomething\tone\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          myCodes: {
            HED: {
              one: 'Duration/3 ms',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.deepStrictEqual(issues, [])
      })
    })

    it('should throw an issue if the HED string contains a nested valid short-form tag', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents:
            'onset\tduration\tHED\n' +
            '7\tsomething\tExperiment-control/Geometric\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 135)
      })
    })

    it('should throw an issue if a sidecar HED string contains a nested valid short-form tag', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tmyCodes\n' + '7\tsomething\tone\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          myCodes: {
            HED: {
              one: 'Experiment-control/Geometric',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 2)
        assert.strictEqual(issues[0].code, 139)
        assert.strictEqual(issues[1].code, 135)
      })
    })

    it('should throw an issue if the HED string contains a non-existent path', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tHED\n' + '7\tsomething\tInvalidEvent\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {},
        '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 1)
        assert.strictEqual(issues[0].code, 136)
      })
    })

    it('should throw an issue if a sidecar HED string contains a non-existent path', () => {
      const events = [
        {
          file: { path: '/sub01/sub01_task-test_events.tsv' },
          path: '/sub01/sub01_task-test_events.tsv',
          contents: 'onset\tduration\tmyCodes\n' + '7\tsomething\tone\n',
        },
      ]
      const jsonDictionary = {
        '/sub01/sub01_task-test_events.json': {
          myCodes: {
            HED: {
              one: 'InvalidEvent',
            },
          },
        },
        '/dataset_description.json': { HEDVersion: '8.0.0-alpha.1' },
      }

      return validate.Events.validateEvents(
        events,
        [],
        headers,
        jsonDictionary,
        '',
      ).then(issues => {
        assert.strictEqual(issues.length, 2)
        assert.strictEqual(issues[0].code, 139)
        assert.strictEqual(issues[1].code, 136)
      })
    })
  })
})
