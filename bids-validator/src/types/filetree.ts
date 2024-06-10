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

  contains(parts: string[]): boolean {
    if (parts.length === 0) {
      return false
    } else if (parts.length === 1) {
      return (
        this.files.some((x) => x.name === parts[0]) ||
        this.directories.some((x) => x.name === parts[0])
      )
    } else if (parts.length > 1) {
      const nextDir = this.directories.find((x) => x.name === parts[0])
      if (nextDir) {
        return nextDir.contains(parts.slice(1, parts.length))
      } else {
        return false
      }
    } else {
      return false
    }
  }
}
