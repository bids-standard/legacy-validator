import { assert } from 'chai'
import checkReadme from '../checkReadme'

describe('checkReadme', () => {
  it('returns issues with multiple readme files', () => {
    const fileList = {
      '/README': {
        name: 'README',
        path: '/ds-999/README',
        relativePath: '/README',
        stats: { size: 155 },
      },
      '/README.md': {
        name: 'README.md',
        path: '/ds-999/README.md',
        relativePath: '/README.md',
        stats: { size: 155 },
      },
    }
    const issues = checkReadme(fileList)
    assert.lengthOf(issues, 1)
    assert.equal(issues[0].code, 228)
  })
  it('returns issues with multiple small readme files', () => {
    const fileList = {
      '/README': {
        name: 'README',
        path: '/ds-999/README',
        relativePath: '/README',
        stats: { size: 100 },
      },
      '/README.md': {
        name: 'README.md',
        path: '/ds-999/README.md',
        relativePath: '/README.md',
        stats: { size: 100 },
      },
    }
    const issues = checkReadme(fileList)
    assert.lengthOf(issues, 3)
    const codes = issues.map((issue) => issue.code)
    assert.equal(codes.filter((x) => x === 213).length, 2)
    assert.equal(codes.filter((x) => x === 228).length, 1)
  })
  it('returns no issues on readme with extension', () => {
    const fileList = {
      '/README.md': {
        name: 'README.md',
        path: '/ds-999/README.md',
        relativePath: '/README.md',
        stats: { size: 155 },
      },
    }
    const issues = checkReadme(fileList)
    assert.lengthOf(issues, 0)
  })
  it('returns issue on no readme', () => {
    const fileList = {
      '/bad.md': {
        name: 'bad.md',
        path: '/ds-999/bad.md',
        relativePath: '/bad.md',
        stats: { size: 155 },
      },
    }
    const issues = checkReadme(fileList)
    assert.lengthOf(issues, 1)
    assert.equal(issues[0].code, 101)
  })
})
