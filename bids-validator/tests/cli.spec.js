import { assert } from 'chai'
import { spawn } from 'child_process'
import path from 'path'

const dir = process.cwd()
const data_dir = path.join(dir, 'bids-validator', 'tests', 'data')
const test_data = path.join(data_dir, 'valid_headers')
const data_with_errors = path.join(data_dir, 'empty_files')
const data_without_errors = path.join(data_dir, 'valid_dataset')

const cli_path = './bids-validator/bin/bids-validator'

const colorRegEx = new RegExp(
  '[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]',
)

describe('CLI', () => {
  it('should import the cli without issue', function() {
    try {
      require('../cli')
    } catch (e) {
      assert.equal(e, null)
    }
  })

  it('should display usage hints when no arguments / options are provided', done => {
    const command = spawn('node', [cli_path])
    const usageHint = 'Usage: bids-validator <dataset_directory> [options]'
    let commandOutput = []
    command.stderr.on('data', data => {
      const dataLines = data.toString().split('\n')
      commandOutput = commandOutput.concat(dataLines)
    })
    command.stderr.on('end', () => {
      assert.equal(commandOutput[0], usageHint)
      done()
    })
  })

  it('should accept a directory as the first argument without error', done => {
    const command = spawn('node', [cli_path, test_data])
    let commandOutput = []
    command.stderr.on('data', data => {
      const dataLines = data.toString().split('\n')
      commandOutput = commandOutput.concat(dataLines)
    })
    command.stderr.on('end', () => {
      expect(commandOutput.length).toEqual(0)
      done()
    })
  })

  it('should accept an array of options as the second argument without error', done => {
    const command = spawn('node', [cli_path, test_data, '--json'])
    let commandOutput = []
    command.stderr.on('data', data => {
      const dataLines = data.toString().split('\n')
      commandOutput = commandOutput.concat(dataLines)
    })
    command.stderr.on('end', () => {
      expect(commandOutput.length).toEqual(0)
      done()
    })
  })

  it('without errors should exit with code 0', done => {
    const command = spawn('node', [cli_path, data_without_errors, '--json'])
    command.on('exit', code => {
      assert.equal(code, 0)
      done()
    })
  })

  it('with errors should not exit with code 0', done => {
    const command = spawn('node', [cli_path, data_with_errors])
    command.on('exit', code => {
      assert.notEqual(code, 0)
      done()
    })
  })

  it('with errors should not exit with code 0 with --json argument', done => {
    const command = spawn('node', [cli_path, data_with_errors, '--json'])
    let commandOutput = []
    let output = {}
    command.stdout.on('data', data => {
      const dataLines = data.toString().split('\n')
      commandOutput = commandOutput.concat(dataLines)
    })
    command.stderr.on('end', () => {
      output = JSON.parse(commandOutput.join(''))
    })
    command.on('exit', code => {
      assert(output.issues.errors.length > 0)
      assert.notEqual(code, 0)
      done()
    })
  })

  it('should print valid json when the --json argument is provided', done => {
    const command = spawn('node', [cli_path, test_data, '--json'])
    let commandOutput = ''
    command.stdout.on('data', data => {
      const dataLines = data.toString()
      commandOutput = commandOutput.concat(dataLines)
    })
    command.stdout.on('end', () => {
      try {
        JSON.parse(commandOutput)
        done()
      } catch (e) {
        done(e)
      }
    })
  })

  it('should print with colors by default', done => {
    const command = spawn('node', [cli_path, data_without_errors])

    let commandOutput = ''
    command.stdout.on('data', data => {
      const dataLines = data.toString()
      commandOutput = commandOutput.concat(dataLines)
    })

    command.on('exit', code => {
      assert.equal(colorRegEx.test(commandOutput), true)
      done()
    })
  })

  it('should respect --no-color', done => {
    const command = spawn('node', [cli_path, data_without_errors, '--no-color'])

    let commandOutput = ''
    command.stdout.on('data', data => {
      const dataLines = data.toString()
      commandOutput = commandOutput.concat(dataLines)
    })

    command.on('exit', code => {
      assert.equal(colorRegEx.test(commandOutput), false)
      done()
    })
  })

  it('should print without colors when NO_COLOR env set', done => {
    const command = spawn('node', [cli_path, data_without_errors], {
      env: { ...process.env, NO_COLOR: 'any value' },
    })

    let commandOutput = ''
    command.stdout.on('data', data => {
      const dataLines = data.toString()
      commandOutput = commandOutput.concat(dataLines)
    })

    command.on('exit', code => {
      assert.equal(colorRegEx.test(commandOutput), false)
      done()
    })
  })
})
