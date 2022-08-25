import assert from 'assert'
import bvec from '../validators/bvec/bvec'

describe('bvec', function () {
  it('should allow valid bvec contents', function () {
    const vec = '4 6 2 5\n3 2 3 5\n6 4 3 5'
    bvec({}, vec, function (issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow more or less than 3 rows', function () {
    let vec = '0 4 3 6 1 6 2 4\n 4 3 5 2 4 2 4 5'
    bvec({}, vec, function (issues) {
      assert(issues.length == 1 && issues[0].code == 31)
    })

    vec =
      '0 4 3 6 1 6 2 4\n 4 3 5 2 4 2 4 5\n 4 3 5 2 4 2 4 5\n 4 3 5 2 4 2 4 5'
    bvec({}, vec, function (issues) {
      assert(issues.length == 1 && issues[0].code == 31)
    })
  })

  it('should not allow rows of inconsistent length', function () {
    const vec = '0 4 3 6 1 6 4\n 4 3 4 2 4 5\n 4 3 5 2 4 2 4 5'
    bvec({}, vec, function (issues) {
      assert(issues.length == 1 && issues[0].code == 46)
    })
  })

  it('should catch doublespace separators', function () {
    const vec = '4  6  2  5\n3  2  3  5\n6  4  3  5'
    bvec({}, vec, function (issues) {
      assert(issues.length == 1 && issues[0].code == 47)
    })
  })

  it('should not allow undefined bvecs', function () {
    const vec = undefined
    bvec({}, vec, function (issues) {
      assert(issues.length == 1 && issues[0].code == 88)
    })
  })

  it('should not allow bvecs of types other than string', function () {
    const vec = [0, 1, 2, 3]
    bvec({}, vec, function (issues) {
      assert(issues.length == 1 && issues[0].code == 88)
    })
  })

  it('should not allow bvals to be submitted in place of bvec', function () {
    const vec = '4 6 7'
    bvec({}, vec, function (issues) {
      assert(issues.length == 1 && issues[0].code == 31)
    })
  })
})
