var assert   = require('assert');
var validate = require('../index');

describe('TSV', function(){

// general tsv checks ------------------------------------------------------------------

    var file = {
        name: 'sub-08_ses-test_task-­nback_physio.tsv.gz',
        relativePath: '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_events.tsv'
    };

    it('should not allow empty values saved as empty cells.', function () {
        var tsv = "1.0\t\t0.2\tresponse 1\t12.32";
        validate.TSV.TSV(file, tsv, [], function (issues) {
            assert(issues.length === 1 && issues[0].code === 23);
        });

    });

    it('should not allow missing values that are specified by something other than "n/a".', function () {
        var tsv = "1.0\tNA\t0.2\tresponse 1\t12.32";
        validate.TSV.TSV(file, tsv, [], function (issues) {
            assert(issues.length === 1 && issues[0].code === 24);
        });
    });

    it('should not allow different length rows', function () {
        var tsv = 'header-one\theader-two\theader-three\n' +
                  'value-one\tvalue-two\n' +
                  'value-one\tvalue-two\tvalue-three';
        validate.TSV.TSV(file, tsv, [], function (issues) {
            assert(issues.length === 1 && issues[0].code === 22);
        });
    });

// events checks -----------------------------------------------------------------------

    var eventsFile = {
        name: 'sub-08_ses-test_task-linebisection_events.tsv',
        relativePath: '/sub-08/ses-test/func/sub-08_ses-test_task-linebisection_events.tsv'
    };

    it('should require events files to have "onset" as first header', function () {
        var tsv = 'header-one\tduration\theader-three\n' +
                  'value-one\tvalue-two\tvalue-three';
        validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
            assert(issues.length === 1 && issues[0].code === 20);
        });
    });

    it('should require events files to have "duration" as second header', function () {
        var tsv = 'onset\theader-two\theader-three\n' +
                  'value-one\tvalue-two\tvalue-three';
        validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
            assert(issues.length === 1 && issues[0].code === 21);
        });
    });

    it('should not throw issues for a valid events file', function () {
        var tsv = 'onset\tduration\theader-three\n' +
                  'value-one\tvalue-two\tvalue-three';
        validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
            assert.deepEqual(issues, []);
        });
    });

    it('should not throw issues for a valid events file with only two columns', function () {
        var tsv = 'onset\tduration\n' +
                  'value-one\tvalue-two';
        validate.TSV.TSV(eventsFile, tsv, [], function (issues) {
            assert.deepEqual(issues, []);
        });
    });

    it('should check for the presence of any stimulus files declared', function () {
        var tsv = 'onset\tduration\tstim_file\n' +
                  'value-one\tvalue-two\timages/red-square.jpg';
        var fileList = [{relativePath: '/stimuli/images/blue-square.jpg'}];
        validate.TSV.TSV(eventsFile, tsv, fileList, function (issues) {
            assert(issues.length === 1 && issues[0].code === 52);
        });

        fileList.push({relativePath: '/stimuli/images/red-square.jpg'});
        validate.TSV.TSV(eventsFile, tsv, fileList, function (issues) {
            assert.deepEqual(issues, []);
        });
    });

// participants checks -----------------------------------------------------------------

    var participantsFile = {
        name: 'participants.tsv',
        relativePath: '/participants.tsv'
    };

    it("should not allow participants.tsv files without participant_id columns", function () {
        var tsv = 'subject_id\theader-two\theader-three\n' +
                  'value-one\tvalue-two\tvalue-three';
        validate.TSV.TSV(participantsFile, tsv, [], function (issues) {
            assert(issues.length === 1 && issues[0].code === 48);
        });
    });

    it("should allow a valid participants.tsv file", function () {
        var tsv = 'participant_id\theader-two\theader-three\n' +
                  'value-one\tvalue-two\tvalue-three';
        validate.TSV.TSV(participantsFile, tsv, [], function (issues) {
            assert.deepEqual(issues, []);
        });
    });

    it("should not allow particpants with age 89 and above in participants.tsv file", function () {
        var tsv = 'participant_id\theader-two\tage\n' + 'sub-01\tvalue-two\t89';
        validate.TSV.TSV(participantsFile, tsv, [], function (issues) {
            assert(issues.length === 1 && issues[0].code === 56);
        });
    });

    it("should check participants listed in phenotype/*tsv and sub-ids ", function () {
        var phenotypeParticipants= [{
            list:
                [
                    '10159',
                    '10171',
                    '10189'
                ],
            file:
            { name: 'vmnm.tsv',
            path: '/corral-repl/utexas/poldracklab/openfmri/shared2/ds000030/ds030_R1.0.5/ds000030_R1.0.5//phenotype/vmnm.tsv',
            relativePath: '/phenotype/vmnm.tsv'}}];
        var summary = { sessions: [],
            subjects:
                [
                    '10159',
                    '10171'
                ],
            tasks: [ ],
            totalFiles: 43,
            size: 11845 };
        var issues = [];
        validate.TSV.checkphenotype(phenotypeParticipants, summary, issues, function(issues){
            assert(issues.length === 1 && issues[0].code === 51);
        });
    });

});
