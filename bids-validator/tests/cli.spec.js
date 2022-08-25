import cli from '../cli'
import path from 'path'

const dir = process.cwd()
const data_dir = path.join(dir, 'bids-validator', 'tests', 'data')
const data_with_errors = path.join(data_dir, 'empty_files')
const data_without_errors = path.join(data_dir, 'valid_dataset')

const colorRegEx = new RegExp(
  // eslint-disable-next-line no-control-regex
  '[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]',
)

expect.extend({
  toBeJSON: function (received) {
    try {
      JSON.parse(received)
      return {
        pass: true,
      }
    } catch (err) {
      return {
        pass: false,
      }
    }
  },
})

let mockStdout
let mockStderr
let mockExit
let mockConsoleError

describe('CLI', () => {
  beforeEach(() => {
    // bids-validator uses these
    mockStdout = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true)
    mockStderr = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true)
    // Yargs uses these
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => true)
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => true)
  })
  afterEach(() => {
    mockStdout.mockRestore()
    mockStderr.mockRestore()
    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })
  it('should display usage hints when no arguments / options are provided', async () => {
    try {
      await cli(' ')
    } catch (code) {
      expect(code).toEqual(2)
      // 'jest' is the process name here but usually it is 'bids-validator'
      expect(mockConsoleError.mock.calls[0][0]).toEqual(
        expect.stringContaining('<dataset_directory> [options]'),
      )
    }
  })

  it('should accept a directory as the first argument without error', async () => {
    await expect(cli(data_without_errors)).resolves.toEqual(0)
  })

  it('without errors should exit with code 0', async () => {
    await expect(cli(`${data_without_errors} --json`)).resolves.toEqual(0)
  })

  it('with errors should not exit with code 0', async () => {
    await expect(cli(`${data_with_errors}`)).rejects.toEqual(1)
  })

  it('with errors should not exit with code 0 with --json argument', async () => {
    await expect(cli(`${data_with_errors} --json`)).rejects.toEqual(1)
  })

  it('should print valid json when the --json argument is provided', async () => {
    await expect(cli(`${data_without_errors} --json`)).resolves.toEqual(0)
    expect(mockStdout).toBeCalledWith(expect.toBeJSON())
  })

  it('should print with colors by default', async () => {
    await cli(`${data_without_errors}`)
    expect(mockStdout.mock.calls[0][0]).toMatch(colorRegEx)
  })

  it('should print without colors when NO_COLOR env set', async () => {
    process.env.NO_COLOR = 'any value'
    await cli(`${data_without_errors}`)
    expect(mockStdout.mock.calls[0][0]).not.toMatch(colorRegEx)
    delete process.env.NO_COLOR
  })
})
