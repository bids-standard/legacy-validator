import utils from '../../utils'
import assert from 'assert'

describe('utils.config', function () {
  var codes = [1, 3, 4, 7, 21, 33, 34]
  var conf = {
    ignore: [3],
    warn: [
      4,
      {
        and: [7, { or: [33, 21] }],
      },
    ],
    error: [34, 33],
    ignoredFiles: ['**/**/**/.DS_Store'],
  }

  describe('ignoredFile', function () {
    it('should return true if the file is ignored', function () {
      assert(utils.config.ignoredFile(conf, '/.DS_Store'))
      assert(utils.config.ignoredFile(conf, 'ds001/.DS_Store'))
      assert(utils.config.ignoredFile(conf, 'ds001/sub-01/.DS_Store'))
    })

    it('should return false if the file is not ignored', function () {
      assert(!utils.config.ignoredFile(conf, '/participants.tsv'))
      assert(!utils.config.ignoredFile(conf, 'ds001/README'))
      assert(
        !utils.config.ignoredFile(conf, 'ds001/sub-16/anat/sub-16_T1w.nii.gz'),
      )
    })
  })

  describe('interpret', function () {
    it('should return the correct severity mappings', function () {
      var severityMap = utils.config.interpret(codes, conf)
      assert.deepEqual(severityMap, {
        3: 'ignore',
        4: 'warning',
        7: 'warning',
        21: 'warning',
        33: 'error',
        34: 'error',
      })
    })
  })

  describe('match', function () {
    it('should return a list of triggered codes that match the config', function () {
      assert.deepEqual([3], utils.config.match(codes, conf.ignore))
      assert.deepEqual([4, 7, 33, 21], utils.config.match(codes, conf.warn))
      assert.deepEqual([34, 33], utils.config.match(codes, conf.error))
    })
  })

  describe('flatten', function () {
    it('should return a flattened list of codes', function () {
      assert.deepEqual([3], utils.config.flatten(conf.ignore))
      assert.deepEqual([4, 7, 33, 21], utils.config.flatten(conf.warn))
      assert.deepEqual([34, 33], utils.config.flatten(conf.error))
    })
  })

  describe('andFullfilled', function () {
    it("should return true if the 'and' array is fulfilled by the triggered codes", function () {
      assert(utils.config.andFulfilled(codes, conf.warn[1].and))
    })

    it("should return false if the 'and' array is not fulfilled", function () {
      assert(!utils.config.andFulfilled(codes, [1, 4, 7, 21, 22]))
    })
  })

  describe('orFulfilled', function () {
    it("should return true if the 'or' array is fulfilled by the triggered codes", function () {
      assert(utils.config.orFulfilled(codes, conf.warn[1].and[1].or))
    })

    it("should return false if the 'or' array is not fulfilled", function () {
      assert(!utils.config.orFulfilled(codes, [5, 6]))
    })
  })
})
