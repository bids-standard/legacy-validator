import nifti from 'nifti-js'
import pako from 'pako'
import fs from 'fs'
import zlib from 'zlib'
import testFile from './testFile'
import Issue from '../../utils/issues'
import isNode from '../isNode'

/**
 * Read Nifti Header
 *
 * Takes a files and returns a json parsed nifti
 * header without reading any extra bytes.
 */
function readNiftiHeader(file, annexed, dir, callback) {
  if (isNode) {
    nodeNiftiTest(file, annexed, dir, callback)
  } else {
    browserNiftiTest(file, callback)
  }
}

function nodeNiftiTest(file, annexed, dir, callback) {
  testFile(file, annexed, dir, function(issue, stats, remoteBuffer) {
    file.stats = stats
    if (issue) {
      callback({ error: issue })
      return
    }
    if (stats) {
      if (stats.size < 348) {
        callback({ error: new Issue({ code: 36, file: file }) })
        return
      }
    }
    if (remoteBuffer) {
      callback(parseNIfTIHeader(remoteBuffer, file))
    } else {
      return extractNiftiFile(file, callback)
    }
  })
}

function extractNiftiFile(file, callback) {
  const bytesRead = 1024
  const buffer = Buffer.alloc(bytesRead)

  var decompressStream = zlib
    .createGunzip()
    .on('data', function(chunk) {
      callback(parseNIfTIHeader(chunk, file))
      decompressStream.pause()
    })
    .on('error', function() {
      callback(handleGunzipError(buffer, file))
    })

  fs.open(file.path, 'r', function(err, fd) {
    if (err) {
      callback({ error: new Issue({ code: 44, file: file }) })
      return
    } else {
      fs.read(fd, buffer, 0, bytesRead, 0, function() {
        if (file.name.endsWith('.nii')) {
          callback(parseNIfTIHeader(buffer, file))
        } else {
          decompressStream.write(buffer)
        }
      })
    }
  })
}

function browserNiftiTest(file, callback) {
  const bytesRead = 1024
  if (file.size == 0) {
    callback({ error: new Issue({ code: 44, file: file }) })
    return
  }

  // file size is smaller than nifti header size
  if (file.size < 348) {
    callback({ error: new Issue({ code: 36, file: file }) })
    return
  }

  var blobSlice =
    File.prototype.slice ||
    File.prototype.mozSlice ||
    File.prototype.webkitSlice

  let fileReader = constructBrowserFileReader(file, callback)

  fileReader.readAsArrayBuffer(blobSlice.call(file, 0, bytesRead))
}

function constructBrowserFileReader(file, callback) {
  let fileReader = new FileReader()

  fileReader.onloadend = function() {
    var buffer = new Uint8Array(fileReader.result)
    var unzipped

    try {
      unzipped = file.name.endsWith('.nii') ? buffer : pako.inflate(buffer)
    } catch (err) {
      callback(handleGunzipError(buffer, file))
      return
    }

    callback(parseNIfTIHeader(unzipped, file))
  }
  return fileReader
}
/**
 * Parse NIfTI Header (private)
 *
 * Attempts to parse a header buffer with
 * nifti-js and handles errors.
 */
function parseNIfTIHeader(buffer, file) {
  var header
  try {
    header = nifti.parseNIfTIHeader(buffer)
  } catch (err) {
    // file is unreadable
    return { error: new Issue({ code: 26, file: file }) }
  }
  // file was not originally gzipped
  return header
}

/**
 * Handle Gunzip Error (private)
 *
 * Used when unzipping fails. Tests if file was
 * actually gzipped to begin with by trying to parse
 * the original header.
 */
function handleGunzipError(buffer, file) {
  try {
    nifti.parseNIfTIHeader(buffer)
  } catch (err) {
    // file is unreadable
    return { error: new Issue({ code: 26, file: file }) }
  }
  // file was not originally gzipped
  return { error: new Issue({ code: 28, file: file }) }
}

export default readNiftiHeader
