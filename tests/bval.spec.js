var assert = require('assert')
var validators = require('../index')

describe('bval', function() {
  it('should allow proper bval contents', function() {
    var bval = '4 6 2 5 3 23 5'
    validators.bval.bval({}, bval, function(issues) {
      assert.deepEqual(issues, [])
    })
  })

  it('should not allow more than one row', function() {
    var bval = '0 4 3 6 1 6 2 4 1\n 4 3 5 2 4 2 4 5'
    validators.bval.bval({}, bval, function(issues) {
      assert(issues.length == 1 && issues[0].code == 30)
    })
  })

  it('should catch doublespace separators', function() {
    var bval = '4  6  2  5  3  23  5'
    validators.bval.bval({}, bval, function(issues) {
      assert(issues.length == 1 && issues[0].code == 47)
    })
  })

  it('should not allow undefined bvals', function() {
    const bval = undefined
    validators.bval.bval({}, bval, function(issues) {
      assert(issues.length == 1 && issues[0].code == 89)
    })
  })

  it('should not allow bvals of types other than string', function() {
    const bval = [0, 1, 2, 3]
    validators.bval.bval({}, bval, function(issues) {
      assert(issues.length == 1 && issues[0].code == 89)
    })
  })

  it('should not allow bvecs to be submitted in place of bval', function() {
    const bvec = '4 6 7\n 2 3 4\n 4 5 6'
    validators.bval.bval({}, bvec, function(issues) {
      assert(issues.length == 1 && issues[0].code == 30)
    })
  })
})
