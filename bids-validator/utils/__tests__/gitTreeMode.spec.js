import { assert } from 'chai'
import {
  readLsTreeLines,
  readCatFileLines,
  processFiles,
} from '../files/readDir'
import ignore from 'ignore'

describe('gitTreeMode functions', () => {
  describe('readLsTreeLines', () => {
    it('will handle regular files', () => {
      const lsTreeLines = [
        '100644 blob longkeystring    1000000\tfile/path',
        '100644 blob anotherlongkeystring     1\tpath/to/file',
      ]

      const output = readLsTreeLines(lsTreeLines)
      assert.hasAllKeys(output, ['files', 'symlinkFilenames', 'symlinkObjects'])
      assert.isEmpty(output.symlinkFilenames)
      assert.isEmpty(output.symlinkObjects)
      assert.equal(output.files[0].path, 'file/path')
      assert.equal(output.files[0].size, 1000000)
    })

    it('will handle symlinked files', () => {
      const lsTreeLines = [
        '120000 blob e886cd8566b5e97db1fc41bb9364fc22cbe81426     199\tsymlink/filepath',
        '120000 blob e2cd091677489a0377d9062347c32d3efebf4322     199\they/jude/dont/be/afraid',
      ]
      const expected = {
        files: [],
        symlinkFilenames: ['symlink/filepath', 'hey/jude/dont/be/afraid'],
        symlinkObjects: [
          'e886cd8566b5e97db1fc41bb9364fc22cbe81426',
          'e2cd091677489a0377d9062347c32d3efebf4322',
        ],
      }
      assert.deepEqual(readLsTreeLines(lsTreeLines), expected)
    })
  })

  describe('readCatFileLines', () => {
    it('creates file objects from git cat-file output', () => {
      const catFileOutput = [
        'hash blob 140',
        '.git/annex/objects/Mv/99/SHA256E-s54--42c98d14dbe3d066d35897a61154e39ced478cd1f0ec6159ba5f2361c4919878.json/SHA256E-s54--42c98d14dbe3d066d35897a61154e39ced478cd1f0ec6159ba5f2361c4919878.json',
        'otherhash blob 140',
        '.git/annex/objects/QV/mW/SHA256E-s99--bbef536348750373727d3b5856398d7377e5d7e23875eed026b83d12cee6f885.json/SHA256E-s99--bbef536348750373727d3b5856398d7377e5d7e23875eed026b83d12cee6f885.json',
      ]
      const symlinkFilenames = ['path/to/file/a', 'path/to/file/b']
      const output = readCatFileLines(catFileOutput, symlinkFilenames)
      assert.equal(output[0].path, symlinkFilenames[0])
      assert.equal(output[0].size, 54)
    })
  })

  describe('processFiles', () => {
    const ig = ignore().add('.*').add('/derivatives')
    it('aggregates, filters, and augments the files given to it', () => {
      const filesA = [
        {
          path: '.DS_Store',
          size: 1000000,
        },
        {
          path: 'path/to/a',
          size: 100,
        },
        {
          path: 'path/to/b',
          size: 99,
        },
      ]
      const filesB = [
        {
          path: 'path/to/c',
          size: 98,
        },
        {
          path: 'path/to/d',
          size: 1,
        },
        {
          path: 'derivatives/to/derivative_file',
          size: 1,
        },
      ]
      /* Not currently in use.
        const expected = [
          {
            path: '/path/to/dataset/path/to/a',
            size: 100,
            relativePath: '/path/to/a',
            name: 'a',
          },
          {
            path: '/path/to/dataset/path/to/b',
            size: 99,
            relativePath: '/path/to/b',
            name: 'b',
          },
          {
            path: '/path/to/dataset/path/to/c',
            size: 98,
            relativePath: '/path/to/c',
            name: 'c',
          },
          {
            path: '/path/to/dataset/path/to/d',
            size: 1,
            relativePath: '/path/to/d',
            name: 'd',
          },
        ]
      */
      const output = processFiles('/path/to/dataset', ig, filesA, filesB)
      const fileNames = output.map((file) => file.name)
      assert(!fileNames.includes('.DS_Store'), 'filters out ignored files')
      assert(
        !fileNames.includes('derivative_file'),
        'filters out ignored directories',
      )
      assert.deepEqual(fileNames, ['a', 'b', 'c', 'd'], 'aggregates files')
      assert.isString(output[0].relativePath, 'adds relativePath to files')
      assert.isString(output[1].relativePath, 'adds name to files')
    })
  })
})
