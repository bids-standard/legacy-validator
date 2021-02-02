/**
 * Run validation against a list of input files from git pre-receive
 */
import readline from 'readline'
import path from 'path'
import consoleFormat from './consoleFormat'
import { defaultIgnore } from './files/readDir'
import quickTest from '../validators/bids/quickTest'
import fullTest from '../validators/bids/fullTest'

// Disable most tests that might access files
const defaultOptions = {
  ignoreWarnings: true,
  ignoreNiftiHeaders: true,
  ignoreSymlinks: true,
  ignoreSubjectConsistency: true,
  verbose: false,
  gitTreeMode: false,
  remoteFiles: false,
  gitRef: 'HEAD',
  config: { ignore: [44], warn: [], error: [], ignoredFiles: [] },
}

async function generateFileObjects(stream) {
  const ig = defaultIgnore()
  const inputFiles = {}
  let bidsIgnore = true
  let index = 0
  for await (const line of stream) {
    // Part 1, parse bidsignore until 0001 (git delimiter packet)
    if (line === '0001') {
      bidsIgnore = false
    } else {
      if (bidsIgnore) {
        ig.add(line)
      } else {
        // Done with bidsignore, read filename data
        const rootPath = `/${line}`
        /**
         * Simulated file object based on input
         * File size is 1 to prevent 0 size errors but makes some checks inaccurate
         */
        const file = {
          name: path.basename(line),
          path: rootPath,
          relativePath: rootPath,
          size: 1,
        }
        if (ig.ignores(rootPath)) {
          file.ignore = true
        }
        inputFiles[index] = file
        index++
      }
    }
  }
  return inputFiles
}

/**
 * Validate input from stdin as bidsignore + filenames
 *
 * Protocol uses `0000` line to separate the two streams
 * .bidsignore lines are read first
 * One filename per line is read in and bidsignore rules applied
 *
 * @param {AsyncIterable} stream Readline stream
 */
export async function validateFilenames(stream) {
  const inputFiles = await generateFileObjects(stream)
  const couldBeBIDS = quickTest(inputFiles)
  if (couldBeBIDS) {
    await new Promise(resolve => {
      fullTest(inputFiles, defaultOptions, false, '/dev/null', function(
        issues,
        summary,
      ) {
        // eslint-disable-next-line no-console
        console.log(consoleFormat.issues(issues, defaultOptions) + '\n')
        // eslint-disable-next-line no-console
        console.log(consoleFormat.summary(summary, defaultOptions))
        resolve()
      })
    })
    return true
  } else {
    // eslint-disable-next-line no-console
    console.log(
      'This dataset failed a quick validation, please verify it is a BIDS dataset at the root of the git repository',
    )
    return false
  }
}

export async function filenamesOnly() {
  const rl = readline.createInterface({
    input: process.stdin,
  })
  validateFilenames(rl)
}
