const ignore = require('ignore')
const readFile = require('./readFile')
const path = require('path')
const fs = require('fs')
const isNode = typeof window === 'undefined'

/**
 * Read Directory
 *
 * In node it takes a path to a directory and returns
 * an array containing all of the files to a callback.
 * Used to input and organize files in node, in a
 * similar structure to how chrome reads a directory.
 * In the browser it simply passes the file dir
 * object to the callback.
 */
function readDir(dir, callback) {
  /**
   * If the current environment is server side
   * nodejs/iojs import fs.
   */

  var filesObj = {}
  var filesList = []

  function callbackWrapper(ig) {
    if (isNode) {
      filesList = preprocessNode(dir, ig)
    } else {
      filesList = preprocessBrowser(dir, ig)
    }
    // converting array to object
    for (var j = 0; j < filesList.length; j++) {
      filesObj[j] = filesList[j]
    }
    callback(filesObj)
  }
  getBIDSIgnore(dir, callbackWrapper)
}

/**
 * Preprocess file objects from a browser
 *
 * 1. Filters out ignored files and folder.
 * 2. Adds 'relativePath' field of each file object.
 */
function preprocessBrowser(filesObj, ig) {
  var filesList = []
  for (var i = 0; i < filesObj.length; i++) {
    var fileObj = filesObj[i]
    fileObj.relativePath = harmonizeRelativePath(fileObj.webkitRelativePath)
    if (ig.ignores(path.relative('/', fileObj.relativePath))) {
      fileObj.ignore = true
    }
    filesList.push(fileObj)
  }
  return filesList
}

/**
 * Relative Path
 *
 * Takes a file and returns the correct relative path property
 * base on the environment.
 */
function harmonizeRelativePath(path) {
  // This hack uniforms relative paths for command line calls to 'BIDS-examples/ds001/' and 'BIDS-examples/ds001'
  if (path[0] !== '/') {
    var pathParts = path.split('/')
    path = '/' + pathParts.slice(1).join('/')
  }
  return path
}

/**
 * Preprocess directory path from a Node CLI
 *
 * 1. Recursively travers the directory tree
 * 2. Filters out ignored files and folder.
 * 3. Harmonizes the 'relativePath' field
 */
function preprocessNode(dir, ig) {
  var str = dir.substr(dir.lastIndexOf('/') + 1) + '$'
  var rootpath = dir.replace(new RegExp(str), '')
  return getFiles(dir, [], rootpath, ig)
}

/**
 * Recursive helper function for 'preprocessNode'
 */
function getFiles(dir, files_, rootpath, ig) {
  files_ = files_ || []
  const files = fs.readdirSync(dir)
  files.map(file => {
    var fullPath = dir + '/' + file
    var relativePath = fullPath.replace(rootpath, '')
    relativePath = harmonizeRelativePath(relativePath)

    var fileName = file

    var fileObj = {
      name: fileName,
      path: fullPath,
      relativePath: relativePath,
    }

    if (ig.ignores(path.relative('/', relativePath))) {
      fileObj.ignore = true
    }

    if (fs.lstatSync(fullPath).isDirectory()) {
      getFiles(fullPath, files_, rootpath, ig)
    } else {
      files_.push(fileObj)
    }
  })
  return files_
}

function getBIDSIgnore(dir, callback) {
  var ig = ignore()
    .add('.*')
    .add('!*.icloud')
    .add('/derivatives')
    .add('/sourcedata')
    .add('/code')

  var bidsIgnoreFileObj = getBIDSIgnoreFileObj(dir)
  if (bidsIgnoreFileObj) {
    readFile(bidsIgnoreFileObj, function(issue, content) {
      ig = ig.add(content)
      callback(ig)
    })
  } else {
    callback(ig)
  }
  return ig
}

/**
 * Get File object corresponding to the .bidsignore file
 * @param dir
 * @returns File object or null if not found
 */
function getBIDSIgnoreFileObj(dir) {
  var bidsIgnoreFileObj = null
  if (isNode) {
    bidsIgnoreFileObj = getBIDSIgnoreFileObjNode(dir)
  } else {
    bidsIgnoreFileObj = getBIDSIgnoreFileObjBrowser(dir)
  }
  return bidsIgnoreFileObj
}

function getBIDSIgnoreFileObjNode(dir) {
  var bidsIgnoreFileObj = null
  var path = dir + '/.bidsignore'
  if (fs.existsSync(path)) {
    bidsIgnoreFileObj = { path: path }
  }
  return bidsIgnoreFileObj
}

function getBIDSIgnoreFileObjBrowser(dir) {
  var bidsIgnoreFileObj = null
  for (var i = 0; i < dir.length; i++) {
    var fileObj = dir[i]
    var relativePath = harmonizeRelativePath(fileObj.webkitRelativePath)
    if (relativePath === '/.bidsignore') {
      bidsIgnoreFileObj = fileObj
      break
    }
  }
  return bidsIgnoreFileObj
}

module.exports = readDir
