import { BIDSFile } from '../types/file.ts'
import { FileTree } from '../types/filetree.ts'
import { FileIgnoreRules } from './ignore.ts'
import { parse, posix, SEPARATOR_PATTERN } from '../deps/path.ts'

/**
 * Browser implement of BIDSFile wrapping native File/FileList types
 */
export class BIDSFileBrowser implements BIDSFile {
  #ignore: FileIgnoreRules
  #file: File
  name: string
  path: string

  constructor(file: File, ignore: FileIgnoreRules) {
    this.#file = file
    this.#ignore = ignore
    this.name = file.name
    // @ts-expect-error webkitRelativePath does exist in the browser
    const relativePath = this.#file.webkitRelativePath
    const prefixLength = relativePath.indexOf('/')
    this.path = relativePath.substring(prefixLength)
  }

  get size(): number {
    return this.#file.size
  }

  get stream(): ReadableStream<Uint8Array> {
    return this.#file.stream()
  }

  get ignored(): boolean {
    return this.#ignore.test(this.path)
  }

  text(): Promise<string> {
    return this.#file.text()
  }

  async readBytes(size: number, offset = 0): Promise<Uint8Array> {
    return new Uint8Array(await this.#file.slice(offset, size).arrayBuffer())
  }
}

/**
 * Convert from FileList (created with webkitDirectory: true) to FileTree for validator use
 */
export function fileListToTree(files: File[]): Promise<FileTree> {
  const ignore = new FileIgnoreRules([])
  const tree = new FileTree('', '/', undefined)
  for (const f of files) {
    const file = new BIDSFileBrowser(f, ignore)
    const fPath = parse(file.path)
    if (fPath.dir === '/') {
      // Top level file
      tree.files.push(file)
    } else {
      const levels = fPath.dir.split(SEPARATOR_PATTERN).slice(1)
      let currentLevelTree = tree
      for (const level of levels) {
        const exists = currentLevelTree.directories.find(
          (d) => d.name === level,
        )
        // If this level exists, set it and descend once
        if (exists) {
          currentLevelTree = exists
        } else {
          // Otherwise make a new level and continue if needed
          const newTree = new FileTree(
            posix.join(currentLevelTree.path, level),
            level,
            currentLevelTree,
          )
          currentLevelTree.directories.push(newTree)
          currentLevelTree = newTree
        }
      }
      // At the terminal leaf, add files
      currentLevelTree.files.push(file)
    }
  }
  return Promise.resolve(tree)
}
