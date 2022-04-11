import { version } from '../../package.json'
import BIDS from './obj'
import reset from './reset'
import quickTest from './quickTest'
import quickTestError from './quickTestError'
import fullTest from './fullTest'
import utils from '../../utils'
import { schemaRegex } from '../../validators/schemaTypes'
import { schemaSetup } from '../../utils/type'

/**
 * Start
 *
 * Takes either a filelist array or
 * a path to a BIDS directory and an
 * options object and starts
 * the validation process and
 * returns the errors and warnings as
 * arguments to the callback.
 */
const start = (dir, options, callback) => {
  if (!options.json) {
    // eslint-disable-next-line
    console.log(`bids-validator@${version}`)
    // eslint-disable-next-line
    console.log(`bids-specification@${options.schema}`)
  }

  utils.options.parse(dir, options, async function (issues, options) {
    if (issues && issues.length > 0) {
      // option parsing issues
      callback({ config: issues })
    } else {
      BIDS.options = options
      reset(BIDS)
      // Load the bids-spec schema ahead of any validation
      let schema
      if (options.schema) {
        schema = await schemaRegex(options.schema)
        schemaSetup(schema)
      }
      const files = await utils.files.readDir(dir, options)
      if (quickTest(files)) {
        // Is the dir using git-annex?
        const annexed = utils.files.remoteFiles.isGitAnnex(dir)
        fullTest(files, BIDS.options, annexed, dir, schema, callback)
      } else {
        // Return an error immediately if quickTest fails
        const issue = quickTestError(dir)
        BIDS.summary.totalFiles = Object.keys(files).length
        callback(utils.issues.format([issue], BIDS.summary, options))
      }
    }
  })
}

export default start
