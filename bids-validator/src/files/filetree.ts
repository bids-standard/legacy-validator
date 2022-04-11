/**
 * Abstract FileTree for all environments (Deno, Browser, Python)
 */

// Avoid overloading the default File type
export interface BIDSFile {
  // Filename
  name: string
  // Dataset relative path for the file
  path: string
  // File size in bytes
  size: Promise<number>
  // BIDS ignore status of the file
  ignored: boolean
  // ReadableStream to file raw contents
  stream: Promise<ReadableStream<Uint8Array>>
}

export class FileTree {
  // Absolute path to this FileTree location
  path: string
  // Name of this directory level
  name: string
  files: BIDSFile[]
  directories: FileTree[]
  parent?: FileTree

  constructor(path: string, name: string, parent?: FileTree) {
    this.path = path
    this.files = []
    this.directories = []
    this.name = name
    this.parent = parent
  }
}
