import assert from 'assert'
import bval from '../validators/bval/bval'

describe('bval', function () {
  it('should allow proper bval contents', function () {
    const val = '4 6 2 5 3 23 5'
    bval({}, val, function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow more than one row', function () {
    const val = '0 4 3 6 1 6 2 4 1\n 4 3 5 2 4 2 4 5'
    bval({}, val, function (issues) {
      assert(issues.length == 1 && issues[0].code == 30)
    })
  })

  it('should catch doublespace separators', function () {
    const val = '4  6  2  5  3  23  5'
    bval({}, val, function (issues) {
      assert(issues.length == 1 && issues[0].code == 47)
    })
  })

  it('should not allow undefined bvals', function () {
    const val = undefined
    bval({}, val, function (issues) {
      assert(issues.length == 1 && issues[0].code == 89)
    })
  })

  it('should not allow bvals of types other than string', function () {
    const val = [0, 1, 2, 3]
    bval({}, val, function (issues) {
      assert(issues.length == 1 && issues[0].code == 89)
    })
  })

  it('should not allow bvecs to be submitted in place of bval', function () {
    const val = '4 6 7\n 2 3 4\n 4 5 6'
    bval({}, val, function (issues) {
      assert(issues.length == 1 && issues[0].code == 30)
    })
  })
})
