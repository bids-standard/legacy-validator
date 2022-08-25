import checkSamples from '../checkSamples'
describe('checkSamples()', () => {
  it('returns issue 214 when no samples.tsv is present', () => {
    const fileList = {
      0: { relativePath: '/test.tsv' },
    }
    const issues = checkSamples(fileList)
    expect(issues.length).toBe(1)
    expect(issues[0].code).toBe(214)
  })

  it('doesnt return issue 214 when samples.tsv is present', () => {
    const fileList = {
      0: { relativePath: '/samples.tsv' },
    }
    const issues = checkSamples(fileList)
    expect(issues.length).toBe(0)
  })
})
