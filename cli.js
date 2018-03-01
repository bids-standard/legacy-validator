/*eslint no-console: ["error", {allow: ["log"]}] */

var validate  = require('./index.js');
var colors    = require('colors/safe');
var cliff     = require('cliff');
var pluralize = require('pluralize');
var bytes     = require('bytes');
var fs        = require('fs');

module.exports = function (dir, options) {
    if (fs.existsSync(dir)) {
        validate.BIDS(dir, options, function (issues, summary) {
            var errors = issues.errors;
            var warnings = issues.warnings;
            if (issues.errors.length === 1 && issues.errors[0].code === '61') {
                console.log(colors.red("(ERR)  The directory " + dir + " failed an initial Quick Test. This means the basic names and structure of the files and directories do not comply with BIDS specification. For more info go to http://bids.neuroimaging.io/"));
            } else if (issues.config && issues.config.length >= 1) {
                console.log(colors.red('(ERR)  Invalid Config File'));
                for (var i = 0; i < issues.config.length; i++) {
                    var issue = issues.config[i];
                    issue.file.file = {relativePath: issue.file.path};
                    issue.files = [issue.file];
                }
                logIssues(issues.config, 'red', options);
            } else if (errors.length >= 1 || warnings.length >= 1) {
                logIssues(errors, 'red', options);
                logIssues(warnings, 'yellow', options);
            }
            else {
                console.log(colors.green("This dataset appears to be BIDS compatible."));
            }
            logSummary(summary);
            if (issues === 'Invalid' || errors && errors.length >= 1 || issues.config && issues.config.length >= 1) {process.exit(1);}
        });
    } else {
        console.log(colors.red(dir + " does not exist"));
        process.exit(2);
    }
};

function logIssues (issues, color, options) {
    for (var i = 0; i < issues.length; i++) {
        var issue = issues[i];
        var type = (color == 'red'?'ERR':'WARN');
        console.log('\t' + colors[color]((i + 1) + ': (' + type + ') ' issue.reason + ' (code: ' + issue.code + ' - ' + issue.key + ')'));
        for (var j = 0; j < issue.files.length; j++) {
            var file = issues[i].files[j];
            if (!file || !file.file) {continue;}
            console.log('\t\t.' + file.file.relativePath);
            if (options.verbose) {console.log('\t\t\t' + file.reason);}
            if (file.line) {
                var msg = '\t\t\t@ line: ' + file.line;
                if (file.character) {
                    msg += ' character: ' + file.character;
                }
                console.log(msg);
            }
            if (file.evidence) {
                console.log('\t\t\tEvidence: ' + file.evidence);
            }

        }
        if (issue.additionalFileCount > 0) {
            console.log('\t\t'+colors[color]('... and '+issue.additionalFileCount+' more files having this issue (Use --verbose to see them all).'));
        }
        console.log();
    }
}

function logSummary (summary) {
    if (summary) {
        var numSessions = summary.sessions.length > 0 ? summary.sessions.length : 1;

        // data
        var column1 = [
                summary.totalFiles + ' ' + pluralize('File', summary.totalFiles) + ', ' + bytes(summary.size),
                summary.subjects.length + ' - ' + pluralize('Subject', summary.subjects.length),
                numSessions + ' - ' + pluralize('Session', numSessions)
            ],
            column2 = summary.tasks,
            column3 = summary.modalities;

        var longestColumn = Math.max(column1.length, column2.length, column3.length);
        var pad = '       ';

        // headers
        var headers = [pad, colors.blue.underline('Summary:') + pad, colors.blue.underline('Available Tasks:') + pad, colors.blue.underline('Available Modalities:')]

        // rows
        var rows = [headers];
        for (var i = 0; i < longestColumn; i++) {
            var val1, val2, val3;
            val1 = column1[i] ? column1[i] + pad : '';
            val2 = column2[i] ? column2[i] + pad : '';
            val3 = column3[i] ? column3[i] : '';
            rows.push(['       ', val1, val2, val3]);
        }
        console.log(cliff.stringifyRows(rows));

        console.log();
    }
}
