import fs from 'fs'
import Issue from '../../utils/issues'
import remoteFiles from './remoteFiles'
import options from '../../utils/options'

/**
 * Test File
 *
 * Takes a file and callback and tests if it's viable for
 * reading and is larger than 0 kb. Calls back with an error and stats if it isn't
 * or null and stats if it is.
 */
function testFile(file, annexed, dir, callback) {
  fs.access(file.path, function (accessErr) {
    if (!accessErr) {
      // accessible
      handleFsAccess(file, callback)
    } else {
      // inaccessible
      fs.lstat(file.path, function (lstatErr, lstats) {
        if (!lstatErr && lstats && lstats.isSymbolicLink()) {
          // symlink
          if (options.getOptions().remoteFiles)
            // only follow symlinks when --remoteFiles option is on
            handleRemoteAccess(file, annexed, dir, callback)
          else
            callback(
              new Issue({
                code: 114,
                file,
              }),
              file.stats,
            )
        } else {
          // inaccessible local file
          callback(new Issue({ code: 44, file: file }), file.stats)
        }
      })
    }
  })
}

function handleFsAccess(file, callback) {
  process.nextTick(function () {
    if (file.stats.size === 0) {
      callback(
        new Issue({
          code: 99,
          file: file,
          reason: `Empty files (${file.path}) not allowed.`,
        }),
        file.stats,
      )
    }
    callback(null, file.stats)
  })
}

function handleRemoteAccess(file, annexed, dir, callback) {
  if (annexed) {
    // Set byte retrieval limits based on file type
    const limit = file.name.includes('.nii') ? 500 : false
    // Call process to get remote files
    // It will call callback with content or error
    remoteFiles.getAnnexedFile(file, dir, limit, callback)
  } else {
    callback(new Issue({ code: 43, file: file }), file.stats)
  }
}

export default testFile
