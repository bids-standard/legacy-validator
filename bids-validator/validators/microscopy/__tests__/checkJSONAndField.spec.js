import checkJSONAndField from '../checkJSONAndField'

describe('checkJSONAndField()', () => {
  const emptyJsonContentsDict = {
    'test.json': {},
  }
  it('returns no issues with empty arguments', () => {
    const issues = checkJSONAndField({}, {})
    expect(issues.length).toBe(0)
  })

  it('returns issue 225 with no json for ome files', () => {
    const files = {
      ome: [{ relativePath: 'test.ome.tif' }],
    }
    const issues = checkJSONAndField(files, emptyJsonContentsDict)
    expect(issues.length).toBe(1)
    expect(issues[0].code).toBe(225)
  })

  it('returns issue 225 with no json for tif files', () => {
    const files = {
      tif: [{ relativePath: 'test.tif' }],
    }
    const issues = checkJSONAndField(files, emptyJsonContentsDict)
    expect(issues.length).toBe(1)
    expect(issues[0].code).toBe(225)
  })

  it('returns issue 225 with no json for png files', () => {
    const files = {
      png: [{ relativePath: 'test.png' }],
    }
    const issues = checkJSONAndField(files, emptyJsonContentsDict)
    expect(issues.length).toBe(1)
    expect(issues[0].code).toBe(225)
  })

  it('returns warning 223 if chunk entity present but missing metadata', () => {
    const files = {
      ome: [{ relativePath: '/test_chunk-01.ome.tif' }],
    }
    const jsonContentsDict = {
      '/test_chunk-01.json': { testKey: 'testValue' },
    }
    const issues = checkJSONAndField(files, jsonContentsDict)
    expect(issues.length).toBe(1)
    expect(issues[0].code).toBe(223)
  })
})
