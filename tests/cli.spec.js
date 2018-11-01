const assert = require('assert')
const { spawn } = require('child_process')
const dir = process.cwd()
const data_dir = dir + '/tests/data/'
const test_data = data_dir + 'valid_headers/'

describe('CLI', () => {
  it('should import the cli without issue', function() {
    try {
      require('../cli')
    } catch (e) {
      assert.equal(e, null)
    }
  })

  it('should display usage hints when no arguments / options are provided', done => {
    const command = spawn('./bin/bids-validator', [])
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
    const command = spawn('./bin/bids-validator', [test_data])
    let commandOutput = []
    command.stderr.on('data', data => {
      const dataLines = data.toString().split('\n')
      commandOutput = commandOutput.concat(dataLines)
    })
    command.stderr.on('end', () => {
      assert.equal(commandOutput.length, 0)
      done()
    })
  })

  it('should accept an array of options as the second argument without error', done => {
    const command = spawn('./bin/bids-validator', [test_data, '--json'])
    let commandOutput = []
    command.stderr.on('data', data => {
      const dataLines = data.toString().split('\n')
      commandOutput = commandOutput.concat(dataLines)
    })
    command.stderr.on('end', () => {
      assert.equal(commandOutput.length, 0)
      done()
    })
  })

  it('should print valid json when the --json argument is provided', done => {
    const command = spawn('./bin/bids-validator', [test_data, '--json'])
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
})
