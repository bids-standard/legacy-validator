const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

const { JSDOM } = require('jsdom')
const { File, FileList } = (new JSDOM()).window

function createFileList(dir) {
  const str = dir.substr(dir.lastIndexOf('/') + 1) + '$'
  const rootpath = dir.replace(new RegExp(str), '')
  const paths = getFilepaths(dir, [], rootpath)
  return paths.map(createFile)
}

function getFilepaths(dir, files_, rootpath, ig) {
  files_ = files_ || []
  const files = fs.readdirSync(dir)
  files.map(file => `${dir}/${file}`)
    .map(path => isDirectory(path)
      ? getFilepaths(path, files_, rootpath, ig)
      : files_.push(path)
    )
  return files_
}

function isDirectory(path) {
  const pathStat = fs.lstatSync(path)
  let isDir = pathStat.isDirectory()
  if (pathStat.isSymbolicLink()) {
    try {
      var targetPath = fs.realpathSync(path)
      isDir = fs.lstatSync(targetPath).isDirectory()
    } catch (err) {
      isDir = false
    }
  }
  return isDir
}

function addFileList(input, file_paths) {
  if (typeof file_paths === 'string')
    file_paths = [file_paths]
  else if (!Array.isArray(file_paths)) {
    throw new Error('file_paths needs to be a file path string or an Array of file path strings')
  }

  const file_list = file_paths.map(fp => createFile(fp))
  file_list.__proto__ = Object.create(FileList.prototype)

  Object.defineProperty(input, 'files', {
    value: file_list,
    writable: false,
  })

  return input
}

function createFile(file_path) {
  const file = fs.statSync(file_path)

  const browserFile = new File(
    [new fs.readFileSync(file_path)],
    path.basename(file_path),
    { lastModified: file.mtimeMs }
  )
  browserFile.webkitRelativePath = file_path
  browserFile.type = mime.lookup(file_path) || ''
  return browserFile
}


module.exports = {
  addFileList,
  createFile,
  createFileList
}