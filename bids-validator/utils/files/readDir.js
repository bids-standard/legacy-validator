import ignore from 'ignore'
import readFile from './readFile'
import path from 'path'
import fs from 'fs'
import * as child_proccess from 'child_process'
import isNode from '../isNode'
import getSessionStorage from '../getSessionStorage'

const sessionStorage = isNode ? getSessionStorage() : window.sessionStorage

/**
 * Read Directory
 *
 * In node it takes a path to a directory and returns
 * an array containing all of the files to a callback.
 * Used to input and organize files in node, in a
 * similar structure to how chrome reads a directory.
 * In the browser it simply passes the file dir
 * object to the callback.
 * @param {String} dir Path to read
 * @param {Object} options
 * @param {boolean} options.ignoreSymlinks enable to prevent recursively following directory symlinks
 * @returns {Promise<Object>}
 */
async function readDir(dir, options = {}) {
  const ig = await getBIDSIgnore(dir)
  const fileArray = isNode
    ? await preprocessNode(path.resolve(dir), ig, options)
    : preprocessBrowser(dir, ig)
  const files = fileArrayToObject(fileArray)
  return files
}

/**
 * Transform array of file-like objects to one object with each file as a property
 * @param {Array[Object]} fileArray
 * @returns {Object}
 */
function fileArrayToObject(fileArray) {
  const filesObj = {}
  // converting array to object
  for (let j = 0; j < fileArray.length; j++) {
    filesObj[j] = fileArray[j]
  }
  return filesObj
}

/**
 * Preprocess file objects from a browser
 *
 * 1. Filters out ignored files and folder.
 * 2. Adds 'relativePath' field of each file object.
 */
function preprocessBrowser(filesObj, ig) {
  const filesList = []
  for (let i = 0; i < filesObj.length; i++) {
    const fileObj = filesObj[i]
    fileObj.relativePath = harmonizeRelativePath(fileObj.webkitRelativePath)
    if (ig.ignores(path.relative('/', fileObj.relativePath))) {
      fileObj.ignore = true
    }
    filesList.push(fileObj)
  }
  return filesList
}

/**
 * Harmonize Relative Path
 *
 * Takes a file and returns the browser style relative path
 * base on the environment.
 *
 * Since this may be called in the browser, do not call Node.js modules
 *
 * @param {String} path Relative path to normalize
 * @returns {String}
 */
function harmonizeRelativePath(path) {
  // This hack uniforms relative paths for command line calls to 'BIDS-examples/ds001/' and 'BIDS-examples/ds001'
  if (path.indexOf('\\') !== -1) {
    // This is likely a Windows path - Node.js
    const pathParts = path.split('\\')
    return '/' + pathParts.slice(1).join('/')
  } else if (path[0] !== '/') {
    // Bad POSIX path - Node.js
    const pathParts = path.split('/')
    return '/' + pathParts.slice(1).join('/')
  } else {
    // Already correct POSIX path - Browsers (all platforms)
    return path
  }
}

/**
 * Preprocess directory path from a Node CLI
 *
 * 1. Recursively travers the directory tree
 * 2. Filters out ignored files and folder.
 * 3. Harmonizes the 'relativePath' field
 */
async function preprocessNode(dir, ig, options) {
  const str = dir.substr(dir.lastIndexOf(path.sep) + 1) + '$'
  const rootpath = dir.replace(new RegExp(str), '')
  if (options.gitTreeMode) {
    // if in gitTreeMode, attempt to get files from git-annex metadata
    // before using fs
    const files = await getFilesFromGitTree(dir, ig, options)
    if (files !== null) return files
  }
  return await getFilesFromFs(dir, rootpath, ig, options)
}

/**
 * runs command `git ls-tree -l -r <git-ref>` in given directory
 * @param {string} cwd path to dataset directory
 * @param {string} gitRef git ref (commit hash, ref, 'HEAD', etc)
 * @returns {string[]}
 */
const getGitLsTree = (cwd, gitRef) =>
  new Promise((resolve) => {
    let output = ''
    const gitProcess = child_proccess.spawn(
      'git',
      ['ls-tree', '-l', '-r', gitRef],
      {
        cwd,
        encoding: 'utf-8',
      },
    )
    gitProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    gitProcess.stderr.on('data', () => {
      resolve(null)
    })
    gitProcess.on('close', () => {
      resolve(output.trim().split('\n'))
    })
  })

const readLsTreeLines = (gitTreeLines) =>
  gitTreeLines
    .map((line) => {
      const [metadata, path] = line.split('\t')
      const [mode, objType, objHash, size] = metadata.split(/\s+/)
      return { path, mode, objType, objHash, size }
    })
    .filter(
      ({ path, mode }) =>
        // skip git / datalad files and submodules
        !/^\.git/.test(path) &&
        !/^\.datalad/.test(path) &&
        '.gitattributes' !== path &&
        mode !== '160000',
    )
    .reduce(
      (
        // accumulator
        { files, symlinkFilenames, symlinkObjects },
        // git-tree line
        { path, mode, objHash, size },
      ) => {
        // read ls-tree line
        if (mode === '120000') {
          symlinkFilenames.push(path)
          symlinkObjects.push(objHash)
        } else {
          files.push({
            path,
            size: parseInt(size),
          })
        }
        return { files, symlinkFilenames, symlinkObjects }
      },
      { files: [], symlinkFilenames: [], symlinkObjects: [] },
    )

/**
 * runs `git cat-file --batch --buffer` in given directory
 * @param {string} cwd
 * @param {string} input
 * @returns {string[]}
 */
const getGitCatFile = (cwd, input) =>
  new Promise((resolve) => {
    let output = ''
    const gitProcess = child_proccess.spawn(
      'git',
      ['cat-file', '--batch', '--buffer'],
      {
        cwd,
        encoding: 'utf-8',
      },
    )

    // pass in symlink objects
    gitProcess.stdin.write(input)
    gitProcess.stdin.end()

    gitProcess.stdout.on('data', (data) => {
      output += data.toString()
    })
    gitProcess.stderr.on('data', () => {
      resolve(null)
    })
    gitProcess.on('close', () => {
      resolve(output.trim().split('\n'))
    })
  })

const readCatFileLines = (gitCatFileLines, symlinkFilenames) =>
  gitCatFileLines
    // even lines contain unneeded metadata
    .filter((_, i) => i % 2 === 1)
    .map((line, i) => {
      const path = symlinkFilenames[i]
      const key = line.split('/').pop()
      const size = parseInt(key.match(/-s(\d+)/)[1])
      return {
        path,
        size,
      }
    })

const processFiles = (dir, ig, ...fileLists) =>
  fileLists
    .reduce((allFiles, files) => [...allFiles, ...files], [])
    .map((file) => {
      file.relativePath = path.normalize(`${path.sep}${file.path}`)
      return file
    })
    .filter((file) => {
      const ignore = ig.ignores(file.relativePath.slice(1))
      return !ignore
    })
    .map((file) => {
      file.relativePath = harmonizeRelativePath(file.relativePath)
      file.name = path.basename(file.path)
      file.path = path.join(dir, file.relativePath)
      return file
    })

async function getFilesFromGitTree(dir, ig, options) {
  const gitTreeLines = await getGitLsTree(dir, options.gitRef)
  if (
    gitTreeLines === null ||
    (gitTreeLines.length === 1 && gitTreeLines[0] === '')
  )
    return null
  const { files, symlinkFilenames, symlinkObjects } =
    readLsTreeLines(gitTreeLines)

  const gitCatFileLines = await getGitCatFile(dir, symlinkObjects.join('\n'))
  // example gitCatFile output:
  //   .git/annex/objects/Mv/99/SHA256E-s54--42c98d14dbe3d066d35897a61154e39ced478cd1f0ec6159ba5f2361c4919878.json/SHA256E-s54--42c98d14dbe3d066d35897a61154e39ced478cd1f0ec6159ba5f2361c4919878.json
  //   .git/annex/objects/QV/mW/SHA256E-s99--bbef536348750373727d3b5856398d7377e5d7e23875eed026b83d12cee6f885.json/SHA256E-s99--bbef536348750373727d3b5856398d7377e5d7e23875eed026b83d12cee6f885.json
  const symlinkFiles = readCatFileLines(gitCatFileLines, symlinkFilenames)

  return processFiles(dir, ig, files, symlinkFiles)
}

/**
 * Recursive helper function for 'preprocessNode'
 */
async function getFilesFromFs(dir, rootPath, ig, options, parent = []) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true })
  const filesAccumulator = parent
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    const relativePath = harmonizeRelativePath(
      path.relative(rootPath, fullPath),
    )
    const ignore = ig.ignores(path.relative('/', relativePath))
    const fileObj = {
      name: file.name,
      path: fullPath,
      relativePath,
    }
    if (ignore) {
      fileObj.ignore = true
    }
    // Three cases to consider: directories, files, symlinks
    if (file.isDirectory()) {
      await getFilesFromFs(fullPath, rootPath, ig, options, filesAccumulator)
    } else if (file.isSymbolicLink()) {
      // Allow skipping symbolic links which lead to recursion
      // Disabling this is a big performance advantage on high latency
      // storage but it's a good default for versatility
      if (!options.ignoreSymlinks) {
        try {
          const targetPath = await fs.promises.realpath(fullPath)
          const targetStat = await fs.promises.stat(targetPath)
          // Either add or recurse from the target depending
          if (targetStat.isDirectory()) {
            await getFilesFromFs(
              targetPath,
              rootPath,
              ig,
              options,
              filesAccumulator,
            )
          } else {
            filesAccumulator.push(fileObj)
          }
        } catch (err) {
          // Symlink points at an invalid target, skip it
          return
        }
      } else {
        // This branch assumes all symbolic links are not directories
        filesAccumulator.push(fileObj)
      }
    } else {
      filesAccumulator.push(fileObj)
    }
  }
  return filesAccumulator
}

export function defaultIgnore() {
  return ignore()
    .add('.*')
    .add('!*.icloud')
    .add('/derivatives')
    .add('/sourcedata')
    .add('/code')
}

async function getBIDSIgnore(dir) {
  const ig = defaultIgnore()

  const bidsIgnoreFileObj = getBIDSIgnoreFileObj(dir)
  if (bidsIgnoreFileObj) {
    const content = await readFile(bidsIgnoreFileObj)
    ig.add(content)
    // Store the .bidsignore content in session storage
    sessionStorage.setItem('bidsignoreContent', JSON.stringify(content))
  }
  return ig
}

/**
 * Get File object corresponding to the .bidsignore file
 * @param dir
 * @returns File object or null if not found
 */
function getBIDSIgnoreFileObj(dir) {
  if (isNode) {
    return getBIDSIgnoreFileObjNode(dir)
  } else {
    return getBIDSIgnoreFileObjBrowser(dir)
  }
}

function getBIDSIgnoreFileObjNode(dir) {
  const path = dir + '/.bidsignore'
  try {
    fs.accessSync(path)
    return { path: path, stats: { size: null } }
  } catch (err) {
    return null
  }
}

function getBIDSIgnoreFileObjBrowser(dir) {
  for (var i = 0; i < dir.length; i++) {
    const fileObj = dir[i]
    const relativePath = harmonizeRelativePath(fileObj.webkitRelativePath)
    if (relativePath === '/.bidsignore') {
      return fileObj
    }
  }
}

export {
  readDir,
  getFilesFromFs,
  fileArrayToObject,
  harmonizeRelativePath,
  readLsTreeLines,
  readCatFileLines,
  processFiles,
}

export default Object.assign(readDir, {
  readDir,
  getFilesFromFs,
  fileArrayToObject,
  harmonizeRelativePath,
  readLsTreeLines,
  readCatFileLines,
  processFiles,
})
