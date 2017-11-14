var assert = require('chai').assert;
var utils   = require('../utils');
var Test = require("mocha/lib/test");
var BIDS = require('../validators/bids');


var suiteAnat = describe('utils.type.isAnat', function(){
    before(function(done) {
        var goodFilenames = ["/sub-15/anat/sub-15_inplaneT2.nii.gz",
            "/sub-15/ses-12/anat/sub-15_ses-12_inplaneT2.nii.gz",
            "/sub-16/anat/sub-16_T1w.nii.gz",
            "/sub-16/anat/sub-16_T1w.json",
            "/sub-16/anat/sub-16_run-01_T1w.nii.gz",
            "/sub-16/anat/sub-16_acq-highres_T1w.nii.gz",
            "/sub-16/anat/sub-16_rec-mc_T1w.nii.gz"
        ];

        goodFilenames.forEach(function (path) {
            suiteAnat.addTest(new Test("isAnat('" + path + "') === true", function (isdone){
                assert.equal(utils.type.isAnat(path), true);
                isdone();
            }));
        });

        var badFilenames = [
            "/sub-1/anat/sub-15_inplaneT2.nii.gz",
            "/sub-15/ses-12/anat/sub-15_inplaneT2.nii.gz",
            "/sub-16/anat/sub-16_T1.nii.gz",
            "blaaa.nii.gz",
            "/sub-16/anat/sub-16_run-second_T1w.nii.gz",
            "/sub-16/anat/sub-16_run-01_rec-mc_T1w.nii.gz"
        ];

        badFilenames.forEach(function (path) {
            suiteAnat.addTest(new Test("isAnat('" + path + "') === false", function (isdone){
                assert.equal(utils.type.isAnat(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});


var suiteFunc = describe('utils.type.isFunc', function(){
    before(function(done) {
        var goodFilenames = [
            "/sub-15/func/sub-15_task-0back_bold.nii.gz",
            "/sub-15/ses-12/func/sub-15_ses-12_task-0back_bold.nii.gz",
            "/sub-16/func/sub-16_task-0back_bold.json",
            "/sub-16/func/sub-16_task-0back_run-01_bold.nii.gz",
            "/sub-16/func/sub-16_task-0back_acq-highres_bold.nii.gz",
            "/sub-16/func/sub-16_task-0back_rec-mc_bold.nii.gz"
        ];

        goodFilenames.forEach(function (path) {
            suiteFunc.addTest(new Test("isFunc('" + path + "') === true", function (isdone){
                assert.equal(utils.type.isFunc(path), true);
                isdone();
            }));
        });

        var badFilenames = [
            "/sub-1/func/sub-15_inplaneT2.nii.gz",
            "/sub-15/ses-12/func/sub-15_inplaneT2.nii.gz",
            "/sub-16/func/sub-16_T1.nii.gz",
            "blaaa.nii.gz",
            "/sub-16/func/sub-16_run-second_T1w.nii.gz",
            "/sub-16/func/sub-16_task-0-back_rec-mc_bold.nii.gz",
            "/sub-16/func/sub-16_run-01_rec-mc_T1w.nii.gz"
        ];

        badFilenames.forEach(function (path) {
            suiteFunc.addTest(new Test("isFunc('" + path + "') === false", function (isdone){
                assert.equal(utils.type.isFunc(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});


var suiteTop = describe('utils.type.isTopLevel', function(){
    before(function(done) {
        var goodFilenames = ["/README",
            "/CHANGES",
            "/dataset_description.json",
            "/ses-pre_task-rest_bold.json",
            "/dwi.bval",
            "/dwi.bvec",
            "/T1w.json",
            "/acq-test_dwi.json",
            "/rec-test_physio.json"
        ];

        goodFilenames.forEach(function (path) {
            suiteTop.addTest(new Test("isTopLevel('" + path + "') === true", function (isdone){
                assert.equal(utils.type.isTopLevel(path), true);
                isdone();
            }));
        });

        var badFilenames = [
            "/readme.txt",
            "/changelog",
            "/dataset_description.yml",
            "/ses.json",
            "/_T1w.json",
            "/_dwi.json",
            "/_task-test_physio.json"
        ];

        badFilenames.forEach(function (path) {
            suiteTop.addTest(new Test("isTopLevel('" + path + "') === false", function (isdone){
                assert.equal(utils.type.isTopLevel(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});

var suiteSession = describe('utils.type.isSessionLevel', function(){
    before(function(done) {
        var goodFilenames = [
            "/sub-12/sub-12_scans.tsv",
            "/sub-12/ses-pre/sub-12_ses-pre_scans.tsv"
        ];

        goodFilenames.forEach(function (path) {
            suiteSession.addTest(new Test("isSessionLevel('" + path + "') === true", function (isdone){
                assert.equal(utils.type.isSessionLevel(path), true);
                isdone();
            }));
        });

        var badFilenames = ["/sub-12/sub-12.tsv",
            "/sub-12/ses-pre/sub-12_ses-pre_scan.tsv"];

        badFilenames.forEach(function (path) {
            suiteSession.addTest(new Test("isSessionLevel('" + path + "') === false", function (isdone){
                assert.equal(utils.type.isSessionLevel(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});

var suiteDWI = describe('utils.type.isDWI', function(){
    before(function(done) {
        var goodFilenames = [
            "/sub-12/dwi/sub-12_dwi.nii.gz",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.nii.gz",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvec",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bval"
        ];

        goodFilenames.forEach(function (path) {
            suiteDWI.addTest(new Test("isDWI('" + path + "') === true", function (isdone){
                assert.equal(utils.type.isDWI(path), true);
                isdone();
            }));
        });

        var badFilenames = ["/sub-12/sub-12.tsv",
            "/sub-12/ses-pre/sub-12_ses-pre_scan.tsv",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvecs",
            "/sub-12/ses-pre/dwi/sub-12_ses-pre_dwi.bvals"];

        badFilenames.forEach(function (path) {
            suiteDWI.addTest(new Test("isDWI('" + path + "') === false", function (isdone){
                assert.equal(utils.type.isDWI(path), false);
                isdone();
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    return it('dummy test', function() {
        require('assert').ok(true);
    });
});

describe('utils.type.isPhenotypic', function () {
    it('should allow .tsv and .json files in the /phenotype directory', function () {
        assert(utils.type.isPhenotypic('/phenotype/acds_adult.json'));
        assert(utils.type.isPhenotypic('/phenotype/acds_adult.tsv'));
    });

    it('should not allow non .tsv and .json files in the /phenotype directory', function () {
        assert(!utils.type.isPhenotypic('/phenotype/acds_adult.jpeg'));
        assert(!utils.type.isPhenotypic('/phenotype/acds_adult.gif'));
    });
});

describe('utils.type.getPathValues', function () {
    it('should return the correct path values from a valid file path', function () {
        assert.equal(utils.type.getPathValues('/sub-22/ses-1/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz').sub, 22);
        assert.equal(utils.type.getPathValues('/sub-22/ses-1/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz').ses, 1);
        assert.equal(utils.type.getPathValues('/sub-22/func/sub-22_task-rest_acq-prefrontal_physio.tsv.gz').sub, 22);
        assert.equal(utils.type.getPathValues('/sub-22/func/sub-22_task-rest_acq-prefrontal_physio.tsv.gz').ses, null);
    });
});

describe('BIDS.subIDsesIDmismatchtest', function () {
    var code64_seen = false;
    var code65_seen = false;
    it('should return if sub and ses doesnt match', function () {

        var files = { '0':
           { name: 'sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
             path: 'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
             relativePath: 'ds001/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz' },
          '1':
           { name: '/sub-22/ses-1/func/sub-23_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
             path: 'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-22/ses-1/func/sub-23_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
             relativePath: 'ds001/sub-22/ses-1/func/sub-23_ses-1_task-rest_acq-prefrontal_physio.tsv.gz' },
          '2':
           { name: '/sub-22/ses-1/func/sub-22_ses-2_task-rest_acq-prefrontal_physio.tsv.gz',
             path: 'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-22/ses-1/func/sub-22_ses-2_task-rest_acq-prefrontal_physio.tsv.gz',
             relativePath: '/sub-22/ses-1/func/sub-22_ses-2_task-rest_acq-prefrontal_physio.tsv.gz' },
          '3':
           { name: '/sub-25/ses-2/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
             path: 'tests/data/BIDS-examples-1.0.0-rc3u5/ds001/sub-25/ses-2/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz',
             relativePath: 'ds001//sub-25/ses-2/func/sub-22_ses-1_task-rest_acq-prefrontal_physio.tsv.gz' }},

        callback = function (issues) {
            for (var i in issues) {
                if (issues[i]['code'] === 64) {
                    code64_seen = true;
                }
                else if (issues[i]['code'] === 65) {
                    code65_seen = false;
                }
            }
            assert(code64_seen);
            assert(code65_seen);
        };
        assert.equal(BIDS.subIDsesIDmismatchtest(files, callback), true);
        });
});
