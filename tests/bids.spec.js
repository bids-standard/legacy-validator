/*eslint no-console: ["error", { allow: ["log"] }] */

var assert = require('chai').assert;
var after = require('mocha').after;
var validate = require('../index.js');
var request = require('sync-request');
var fs = require('fs');
var AdmZip = require('adm-zip');
var path = require('path');
var Test = require("mocha/lib/test");
var test_version = "1.0.0-rc3u5";

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

var missing_session_files = ['7t_trt', 'ds006', 'ds007', 'ds008', 'ds051', 'ds052', 'ds105', 'ds108', 'ds109', 'ds113b'];

var suite = describe('BIDS example datasets ', function() {
    this.timeout(100000);

    before(function(done) {
        if (!fs.existsSync("tests/data/BIDS-examples-" + test_version + "/")) {
            console.log('downloading test data');
            var response = request("GET", "http://github.com/INCF/BIDS-examples/archive/" + test_version + ".zip");
            if (!fs.existsSync("tests/data")) {
                fs.mkdirSync("tests/data");
            }
            fs.writeFileSync("tests/data/examples.zip", response.body);
            var zip = new AdmZip("tests/data/examples.zip");
            console.log('unzipping test data');
            zip.extractAllTo("tests/data/", true);
        }

        var datasetDirectories = getDirectories("tests/data/BIDS-examples-" + test_version + "/");

        datasetDirectories.forEach(function testDataset(path){
            suite.addTest(new Test(path, function (isdone){
                var options = {ignoreNiftiHeaders: true};
                validate.BIDS("tests/data/BIDS-examples-" + test_version + "/" + path + "/", options, function (issues) {
                    var errors = issues.errors;
                    var warnings = issues.warnings;
                    assert.deepEqual(errors, []);
                    var session_flag = false;
                    for (var warning in warnings) {
                        if (warnings[warning]['code'] === '38') {
                            session_flag = true;
                            break;
                        }
                    }
                    if (missing_session_files.indexOf(path) === -1) {
                        assert.deepEqual(session_flag, false);
                    } else {
                        assert.deepEqual(session_flag, true);
                    }
                    isdone();
                });
            }));
        });
        done();
    });

    // we need to have at least one non-dynamic test
    it('validates path without trailing backslash', function(isdone) {
        var options = {ignoreNiftiHeaders: true};
        validate.BIDS("tests/data/BIDS-examples-" + test_version + "/ds001", options, function (issues, summary) {
            var errors = issues.errors;
            var warnings = issues.warnings;
            assert(summary.sessions.length === 0);
            assert(summary.subjects.length === 16);
            assert.deepEqual(summary.tasks, ['balloon analog risk task']);
            assert.deepEqual(summary.modalities, ['T1w', 'inplaneT2', 'bold']);
            assert(summary.totalFiles === 133);
            assert(summary.size === 803546);
            assert.deepEqual(errors, []);
            assert(warnings.length === 1 && warnings[0].code === '13');
            isdone();
        });
    });

    // we need to have at least one non-dynamic test
    it('validates dataset with valid nifti headers', function(isdone) {
        var options = {ignoreNiftiHeaders: false};
        validate.BIDS("tests/data/valid_headers", options, function (issues, summary) {
            var errors = issues.errors;
            var warnings = issues.warnings;
            assert(summary.sessions.length === 0);
            assert(summary.subjects.length === 1);
            assert.deepEqual(summary.tasks, ['rhyme judgment']);
            assert.deepEqual(summary.modalities, ['T1w', 'bold']);
            assert(summary.totalFiles === 8);
            assert(summary.size === 481793);
            assert(errors[0].code === '60');
            assert(warnings.length === 1 && warnings[0].code === '13');
            isdone();
        });
    });

    // test for illegal characters used in acq and task name
    it('validates dataset with illegal characters in task name', function(isdone) {
        var options = {ignoreNiftiHeaders: false};
        validate.BIDS("tests/data/valid_filenames", options, function (issues) {
            var errors = issues.errors;
            assert(errors[0].code === '58');
            isdone();
        });
    });

    // test for illegal characters used in sub name
    it('validates dataset with illegal characters in sub name', function(isdone) {
        var options = {ignoreNiftiHeaders: false};
        validate.BIDS("tests/data/valid_filenames", options, function (issues) {
            var errors = issues.errors;
            assert(errors[1].code ==='62');
            isdone();
        });
    });

    // Catch some browser specific iteration issues with for .. in loops
    describe('with enumerable array prototype methods', function() {
        before(function () {
            // Patch in a potentially iterable prototype
            Array.prototype.broken = function () { /* custom extension */ };
        });
        after(function () {
            // Unpatch the above
            delete Array.prototype.broken;
        });
        it('validates dataset with illegal characters in task name', function (isdone) {

            var options = {ignoreNiftiHeaders: false};
            validate.BIDS("tests/data/valid_filenames", options, function (issues) {
                var errors = issues.errors;
                assert(errors[0].code === '58');
                isdone();
            });
        });
    });
});
