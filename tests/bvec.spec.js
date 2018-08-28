var assert = require('assert')
const validators = require('../index')

describe('bvec', function() {
  it('should allow valid bvec contents', function() {
    var bvec = '4 6 2 5\n3 2 3 5\n6 4 3 5'
    validators.bvec.bvec({}, bvec, function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow more or less than 3 rows', function() {
    var bvec = '0 4 3 6 1 6 2 4\n 4 3 5 2 4 2 4 5'
    validators.bvec.bvec({}, bvec, function(issues) {
      assert(issues.length == 1 && issues[0].code == 31)
    })

    bvec =
      '0 4 3 6 1 6 2 4\n 4 3 5 2 4 2 4 5\n 4 3 5 2 4 2 4 5\n 4 3 5 2 4 2 4 5'
    validators.bvec.bvec({}, bvec, function(issues) {
      assert(issues.length == 1 && issues[0].code == 31)
    })
  })

  it('should not allow rows of inconsistent length', function() {
    var bvec = '0 4 3 6 1 6 4\n 4 3 4 2 4 5\n 4 3 5 2 4 2 4 5'
    validators.bvec.bvec({}, bvec, function(issues) {
      assert(issues.length == 1 && issues[0].code == 46)
    })
  })

  it('should catch doublespace separators', function() {
    var bvec = '4  6  2  5\n3  2  3  5\n6  4  3  5'
    validators.bvec.bvec({}, bvec, function(issues) {
      assert(issues.length == 1 && issues[0].code == 47)
    })
  })

  it('should not allow undefined bvecs', function() {
    const bvec = undefined
    validators.bvec.bvec({}, bvec, function(issues) {
      assert(issues.length == 1 && issues[0].code == 88)
    })
  })

  it('should not allow bvecs of types other than string', function() {
    const bvec = [0, 1, 2, 3]
    validators.bvec.bvec({}, bvec, function(issues) {
      assert(issues.length == 1 && issues[0].code == 88)
    })
  })

  it('should not allow bvals to be submitted in place of bvec', function() {
    const bval = '4 6 7'
    validators.bvec.bvec({}, bval, function(issues) {
      assert(issues.length == 1 && issues[0].code == 31)
    })
  })
})
