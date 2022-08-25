import { relative, resolve } from '../deps/path.ts'
import { BIDSFile } from '../types/file.ts'

/**
 * File class modeled off browser File for validator
 * implementing only what the validator currently uses.
 */
export class AdapterFile {
  private _stream: ReadableStream // File contents stream
  name: string // Filename
  path: string // Absolute path
  relativePath: string // Dataset relative path (prefixed /)
  webkitRelativePath: string // Duplicate name for relativePath

  constructor(rootPath: string, file: BIDSFile, stream: ReadableStream) {
    this._stream = stream
    this.name = file.name
    // JS validator expects dataset-dir/contents filenames
    const relativePath = relative(rootPath, file.path)
    this.relativePath = `/${relativePath}`
    this.webkitRelativePath = this.relativePath
    this.path = resolve(rootPath, file.path)
  }

  stream(): ReadableStream {
    return this._stream
  }
}
