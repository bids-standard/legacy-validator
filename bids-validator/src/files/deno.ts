/**
 * Deno specific implementation for reading files
 */
import { join, basename } from '../deps/path.ts'
import { FileTree, BIDSFile } from './filetree.ts'

/**
 * Deno implementation of BIDSFile
 */
export class BIDSFileDeno implements BIDSFile {
  name: string
  path: string
  ignored: boolean
  private _fileInfo: Deno.FileInfo | undefined
  private _datasetAbsPath: string

  constructor(datasetPath: string, path: string) {
    this._datasetAbsPath = datasetPath
    this.path = path
    this.name = basename(path)
    this.ignored = false
  }

  private _getPath(): string {
    return join(this._datasetAbsPath, this.path)
  }

  private async _getSize(): Promise<number> {
    if (!this._fileInfo) {
      this._fileInfo = await Deno.stat(this._getPath())
    }
    return this._fileInfo.size
  }

  get size(): Promise<number> {
    return this._getSize()
  }

  private async _getStream(): Promise<ReadableStream<Uint8Array>> {
    // Avoid asking for write access
    const openOptions = { read: true, write: false }
    return (await Deno.open(this._getPath(), openOptions)).readable
  }

  get stream(): Promise<ReadableStream<Uint8Array>> {
    return this._getStream()
  }
}

export class FileTreeDeno extends FileTree {
  // System specific dataset path
  private _datasetRootPath?: string
  constructor(path: string, name: string, parent?: FileTree, rootPath?: string) {
    super(path, name, parent)
    this._datasetRootPath = rootPath
  }
}


export async function _readFileTree(
  rootPath: string,
  relativePath: string,
  parent?: FileTreeDeno,
): Promise<FileTree> {
  const name = basename(relativePath)
  const tree = new FileTreeDeno(relativePath, name, parent, rootPath)
  for await (const dirEntry of Deno.readDir(join(rootPath, relativePath))) {
    if (dirEntry.isFile) {
      tree.files.push(new BIDSFileDeno(rootPath, join(relativePath, dirEntry.name)))
    }
    if (dirEntry.isDirectory) {
      const dirTree = await _readFileTree(rootPath, join(relativePath, dirEntry.name), tree)
      tree.directories.push(dirTree)
    }
  }
  return tree
}

/**
 * Read in the target directory structure and return a FileTree
 */
export function readFileTree(rootPath: string): Promise<FileTree> {
  return _readFileTree(rootPath, '/')
}