/*eslint no-console: ["error", {allow: ["log"]}] */

import { parseOptions } from './validators/options'
import validate from './index.js'

const format = validate.consoleFormat
import colors from 'colors/safe'
import fs from 'fs'
import { filenamesOnly } from './utils/filenamesOnly.js'

const errorToString = (err) => {
  if (err instanceof Error) return err.stack
  else if (typeof err === 'object') return JSON.parse(err)
  else return err
}

/**
 * Write a large string or buffer to stdout and wait for the drain event
 *
 * This is needed to avoid truncating buffered output when piped
 * @param {string} data
 * @param {function} cb
 */
const writeStdout = (data, cb) => {
  if (!process.stdout.write(data)) {
    process.stdout.once('drain', cb)
  } else {
    process.nextTick(cb)
  }
}

export function cli(argumentOverride) {
  return new Promise((resolve, reject) => {
    // Setup CLI state when called via Node.js
    if (process.env['NO_COLOR'] !== undefined) {
      colors.disable()
    }
    process.title = 'bids-validator'
    const argv = parseOptions(argumentOverride)
    const dir = argv._[0]
    const options = argv
    process.on('unhandledRejection', (err) => {
      console.log(
        format.unexpectedError(
          // eslint-disable-next-line
          `Unhandled rejection (\n  reason: ${errorToString(err)}\n).\n`,
        ),
      )
      reject(3)
    })

    if (options.filenames) {
      return filenamesOnly()
    }

    try {
      // Test if we can access the dataset directory at all
      fs.opendirSync(dir)
    } catch (err) {
      console.log(colors.red(dir + ' does not exist or is inaccessible'))
      reject(2)
    }

    validate.BIDS(dir, options, function (issues, summary) {
      function resolveOrReject() {
        if (
          issues === 'Invalid' ||
          (issues.errors && issues.errors.length >= 1) ||
          (issues.config && issues.config.length >= 1)
        ) {
          reject(1)
        } else {
          resolve(0)
        }
      }
      if (options.json) {
        writeStdout(JSON.stringify({ issues, summary }), resolveOrReject)
      } else {
        writeStdout(
          format.issues(issues, options) +
            '\n' +
            format.summary(summary, options),
          resolveOrReject,
        )
      }
    })
  })
}

export default cli
