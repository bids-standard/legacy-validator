/* eslint-disable no-unused-vars */
var Issue = require('../utils').issues.Issue;
var files = require('../utils/files');
var utils  = require('../utils');

/**
 * TSV
 *
 * Takes a TSV file as a string and a callback
 * as arguments. And callsback with any issues
 * it finds while validating against the BIDS
 * specification.
 */
var TSV = function TSV (file, contents, fileList, callback) {

    var issues = [];
    var rows = contents.split('\n');
    var headers = rows[0].split('\t');

// generic checks -----------------------------------------------------------

    var columnMismatch = false;
    var emptyCells     = false;
    var NACells        = false;
    // iterate rows
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (columnMismatch && emptyCells && NACells) {break;}

        // skip empty rows
        if (!row || /^\s*$/.test(row)) {continue;}

        var values = row.split('\t');

        // check for different length rows
        if (values.length !== headers.length && !columnMismatch) {
            columnMismatch = true;
            issues.push(new Issue({
                file: file,
                evidence: row,
                line: i + 1,
                code: 22
            }));
        }

        // iterate values
        for (var j = 0; j < values.length; j++) {
            var value = values[j];
            if (columnMismatch && emptyCells && NACells) {break;}

            if (value === "" && !emptyCells) {
                emptyCells = true;
                // empty cell should raise an error
                issues.push(new Issue({
                    file: file,
                    evidence: row,
                    line: i + 1,
                    character: "at column # " + (j+1),
                    code: 23
                }));
            } else if ((value === "NA" || value === "na" || value === "nan") && !NACells) {
                NACells = true;
                // check if missing value is properly labeled as 'n/a'
                issues.push(new Issue({
                    file: file,
                    evidence: row,
                    line: i + 1,
                    character: "at column # " + (j+1),
                    code: 24
                }));
            }
        }
    }

// specific file checks -----------------------------------------------------

    // events.tsv
    if (file.name.endsWith('_events.tsv')) {
        if (headers[0] !== "onset"){
            issues.push(new Issue({
                file: file,
                evidence: headers,
                line: 1,
                character: rows[0].indexOf(headers[0]),
                code: 20
            }));
        }
        if (!(headers[1] == "duration" || headers[1] == "duration\\n")){
            issues.push(new Issue({
                file: file,
                evidence: headers,
                line: 1,
                character: rows[0].indexOf(headers[1]),
                code: 21
            }));
        }

        // create full dataset path list
        var pathList = [];
        for (var f in fileList) {
            pathList.push(fileList[f].relativePath);
        }

        // check for stimuli file presence
        var stimFiles = [];
        if (headers.indexOf('stim_file') > -1) {
            for (var k = 0; k < rows.length; k++) {
                var stimFile = rows[k].split('\t')[headers.indexOf('stim_file')];
                if (stimFile && stimFile !== 'n/a' && stimFile !== 'stim_file' && stimFiles.indexOf(stimFile) == -1) {
                    stimFiles.push(stimFile);
                    if (pathList.indexOf('/stimuli/' + stimFile) == -1) {
                        issues.push(new Issue({
                            file: file,
                            evidence: stimFile,
                            reason: 'A stimulus file (' + stimFile + ') was declared but not found in /stimuli.',
                            line: k + 1,
                            character: rows[k].indexOf(stimFile),
                            code: 52
                        }));
                    }
                }
            }
        }
    }

    // participants.tsv
    var participants = null;
    if (file.name === 'participants.tsv' || file.relativePath.includes('phenotype/')) {
        var participantIdColumn = headers.indexOf('participant_id');
        if (participantIdColumn === -1) {
            issues.push(new Issue({
                file: file,
                evidence: headers.join('\t'),
                line: 1,
                code: 48
            }));
        } else {
            participants = [];
            for (var l = 1; l < rows.length; l++) {
                row = rows[l].split('\t');
                // skip empty rows
                if (!row || /^\s*$/.test(row)) {continue;}
                participants.push(row[participantIdColumn].replace('sub-', ''));
            }
        }

    }
  // check partcipants.tsv for age 89+

    if (file.name === 'participants.tsv'){
        checkage89_plus(rows, file, issues);
    }

    callback(issues, participants);
};
var checkphenotype = function (phenotypeParticipants, summary, issues) {
    for (var j=0; j < phenotypeParticipants.length; j++){
        var fileParticpants = phenotypeParticipants[j];
        if (phenotypeParticipants && phenotypeParticipants.length > 0 && (!utils.array.equals(fileParticpants.list, summary.subjects.sort(), true))) {
            issues.push(new Issue({
                code: 51,
                evidence: fileParticpants.file + "- " + fileParticpants.list + "  Subjects -" + fileParticpants,
                file: fileParticpants.file
            }));
        }
    }
};

var checkage89_plus = function(rows, file, issues){
    var header = rows[0].trim().split('\t');
    var ageIdColumn = header.indexOf("age");
    for (var a = 0; a < rows.length; a++) {
        var line = rows[a];
        var line_values = line.trim().split('\t');
        var age = line_values[ageIdColumn];
        if (age >= 89) {
            issues.push(new Issue({
                file: file,
                evidence: line,
                line: a + 1,
                character: "age of partcipant is above 89 ",
                code: 56
            }));
        }
    }
};
module.exports = {
    TSV: TSV,
    checkphenotype : checkphenotype
};
