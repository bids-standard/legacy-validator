/**
 * Abstract FileTree for all environments (Deno, Browser, Python)
 */
import { BIDSFile } from '../types/file.ts'

export class FileTree {
  // Relative path to this FileTree location
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
