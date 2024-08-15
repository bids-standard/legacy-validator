import { parse, SEPARATOR_PATTERN } from '@std/path'
import * as posix from '@std/path/posix'
import { BIDSFile, FileTree } from '../types/filetree.ts'

const dummy = {
  size: 0,
  ignored: false,
  stream: new ReadableStream(),
  text: () => Promise.resolve(''),
  readBytes: () => Promise.resolve(new Uint8Array()),
  parent: new FileTree('', '/'),
  viewed: false,
}

export function pathsToTree(paths: string[]): FileTree {
  return filesToTree(paths.map((path) => {
    const name = path.split('/').pop() as string
    return { name, path, ...dummy }
  }))
}

export function filesToTree(fileList: BIDSFile[]): FileTree {
  const tree: FileTree = new FileTree('/', '/')
  for (const file of fileList) {
    const parts = parse(file.path)
    if (parts.dir === '/') {
      tree.files.push(file)
      file.parent = tree
      continue
    }
    let current = tree
    for (const level of parts.dir.split(SEPARATOR_PATTERN).slice(1)) {
      const exists = current.directories.find((dir) => dir.name === level)
      if (exists) {
        current = exists
        continue
      }
      const newTree = new FileTree(posix.join(current.path, level), level, current)
      current.directories.push(newTree)
      current = newTree
    }
    current.files.push(file)
    file.parent = current
  }
  return tree
}