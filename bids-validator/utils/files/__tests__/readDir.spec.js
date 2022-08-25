import readDir from '../readDir.js'

describe('readDir.js', () => {
  describe('fileArrayToObject', () => {
    it('transforms an array to an object', () => {
      expect(
        readDir.fileArrayToObject([
          { name: 'one' },
          { name: 'two' },
          { name: 'three' },
        ]),
      ).toEqual({
        0: {
          name: 'one',
        },
        1: {
          name: 'two',
        },
        2: {
          name: 'three',
        },
      })
    })
  })
  describe('harmonizeRelativePath', () => {
    it('harmonizes a basic POSIX path', () => {
      expect(readDir.harmonizeRelativePath('test/a/path')).toEqual('/a/path')
    })
    it('does not mangle absolute Windows paths', () => {
      expect(readDir.harmonizeRelativePath('C:\\dataset\\directory')).toEqual(
        '/dataset/directory',
      )
    })
    it('does not mangle relative Windows paths', () => {
      expect(readDir.harmonizeRelativePath('dataset\\directory')).toEqual(
        '/directory',
      )
    })
    it('does not mangle relative Windows paths with parent directories', () => {
      expect(
        readDir.harmonizeRelativePath('..\\..\\dataset\\directory'),
      ).toEqual('/../dataset/directory')
    })
  })
})
