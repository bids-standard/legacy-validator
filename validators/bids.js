var async  = require('async');
var fs     = require('fs');
var path   = require('path');
var utils  = require('../utils');
var Issue  = utils.issues.Issue;

var TSV    = require('./tsv');
var json   = require('./json');
var NIFTI  = require('./nii');
var bval   = require('./bval');
var bvec   = require('./bvec');
var session = require('./session');
var headerFields = require('./headerFields');

var BIDS;
BIDS = {

    options: {},
    issues: [],

    /**
     * Start
     *
     * Takes either a filelist array or
     * a path to a BIDS directory and an
     * options object and starts
     * the validation process and
     * returns the errors and warnings as
     * arguments to the callback.
     */
    start: function (dir, options, callback) {
        var self = BIDS;
        utils.options.parse(options, function (issues, options) {
            if (issues && issues.length > 0) {
                // option parsing issues
                callback({config: issues});
            } else {
                self.options = options;
                BIDS.reset();
                utils.files.readDir(dir, function (files) {
                    self.quickTest(files, function (couldBeBIDS) {
                        if (couldBeBIDS) {
                            self.fullTest(files, callback);
                        } else {
                            // Return an error immediately if quickTest fails
                            var issue = self.quickTestError(dir);
                            var summary = {
                                sessions: [],
                                subjects: [],
                                tasks: [],
                                modalities: [],
                                totalFiles: Object.keys(files).length,
                                size: 0
                            };
                            callback(utils.issues.format([issue], summary, options));
                        }
                    });
                });
            }
        });
    },

    /*
     * Generates an error for quickTest failures
     */
    quickTestError: function (dir) {
        var filename;
        if (typeof window === 'undefined') {
            // For Node, grab the path from the dir string
            filename = path.basename(dir);
        } else {
            // Browser side we need to look it up more carefully
            if (dir.length && 'webkitRelativePath' in dir[0]) {
                var wrp = dir[0].webkitRelativePath;
                while (wrp.indexOf(path.sep) !== -1) {
                    wrp = path.dirname(wrp);
                }
                filename = wrp;
            } else {
                // Fallback for non-standard webkitRelativePath
                filename = 'uploaded-directory';
            }
        }
        var issue = new Issue({
            code: 61,
            file: {
                name: filename,
                path: path.join('.', filename),
                relativePath: path.join('', filename)
            }
        });
        return issue;
    },

    /**
     * Quick Test
     *
     * A quick test to see if it could be a BIDS
     * dataset based on structure/naming. If it
     * could be it will trigger the full validation
     * otherwise it will throw a callback with a
     * generic error.
     */
    quickTest: function (fileList, callback) {
        var couldBeBIDS = false;
        for (var key in fileList) {
            if (fileList.hasOwnProperty(key)) {
                var file = fileList[key];
                var path = utils.files.relativePath(file);
                if (path) {
                    path = path.split('/');
                    path = path.reverse();
                    if (
                        path[0].includes('.nii') &&
                        (
                            path[1] == 'anat' ||
                            path[1] == 'func' ||
                            path[1] == 'dwi'
                        ) &&
                        (
                            (path[2] && path[2].indexOf('ses-') == 0) ||
                            (path[2] && path[2].indexOf('sub-') == 0)
                        )
                    ) {
                        couldBeBIDS = true;
                        break;
                    }
                }
            }
        }
        callback(couldBeBIDS);
    },

    /**
     * Full Test
     *
     * Takes on an array of files and starts
     * the validation process for a BIDS
     * package.
     */
    fullTest: function (fileList, callback) {
        var self = this;

        var jsonContentsDict = {},
            bContentsDict = {},
            events = [],
            niftis = [],
            headers = [],
            participants = null,
            phenotypeParticipants = [],
            hasSubjectDir = false;

        var summary = {
            sessions: [],
            subjects: [],
            tasks: [],
            modalities: [],
            totalFiles: Object.keys(fileList).length,
            size: 0
        };


        // check for illegal character in task name and acq name

        var task_re = /sub-(.*?)_task-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*(?:_acq-[a-zA-Z0-9-]*)?(?:_run-\d+)?_/g;
        var acq_re = /sub-(.*?)_task-\w+.\w+(_acq-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*)(?:_run-\d+)?_/g;

        var sub_re = /sub-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*_/g;   // illegal character in sub
        var ses_re = /ses-[a-zA-Z0-9]*[_-][a-zA-Z0-9]*?_(.*?)/g; //illegal character in ses

        var illegalchar_regex_list = [
            [task_re, 58, "task name contains illegal character:"],
            [acq_re, 59, "acq name contains illegal character:"],
            [sub_re, 62, "sub name contains illegal character:" ],
            [ses_re, 63, "ses name contains illegal character:" ]
        ];


        for (var f in fileList) {
            var completename = fileList[f].relativePath;
            if(!completename.startsWith('/derivatives')) {
                for (var re_index = 0; re_index < illegalchar_regex_list.length; re_index++) {
                    var err_regex = illegalchar_regex_list[re_index][0];
                    var err_code = illegalchar_regex_list[re_index][1];
                    var err_evidence = illegalchar_regex_list[re_index][2];

                    if (err_regex.exec(completename)) {
                        self.issues.push(new Issue({
                            file: fileList[f],
                            code: err_code,
                            evidence: err_evidence + fileList[f].relativePath
                        }));
                    }
                }
            }
        }


        // validate individual files
        async.eachOfLimit(fileList, 200, function (file, key, cb) {
            var path = utils.files.relativePath(file);
            file.relativePath = path;

            // check for subject directory presence
            if (path.startsWith('/sub-')) {
                hasSubjectDir = true;
            }

            // ignore associated data
            if (utils.type.isAssociatedData(file.relativePath)) {
                process.nextTick(cb);
            }

            // validate path naming
            else if (!utils.type.isBIDS(file.relativePath)) {
                self.issues.push(new Issue({
                    file: file,
                    evidence: file.name,
                    code: 1
                }));
                process.nextTick(cb);
            }

            // capture niftis for later validation
            else if (file.name.endsWith('.nii') || file.name.endsWith('.nii.gz')) {
                niftis.push(file);

                // collect modality summary
                var pathParts = path.split('_');
                var suffix = pathParts[pathParts.length - 1];
                suffix = suffix.slice(0, suffix.indexOf('.'));
                if (summary.modalities.indexOf(suffix) === -1) {
                    summary.modalities.push(suffix);
                }

                process.nextTick(cb);
            }

            // validate tsv
            else if (file.name && file.name.endsWith('.tsv')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        process.nextTick(cb);
                        return;
                    }
                    if (file.name.endsWith('_events.tsv')) {
                        events.push(file.relativePath);
                    }
                    TSV(file, contents, fileList, function (issues, participantList) {
                        if (participantList) {
                            if (file.name.endsWith('participants.tsv')) {
                                participants = {
                                    list: participantList,
                                    file: file
                                };
                            } else if (file.relativePath.includes('phenotype/')) {
                                phenotypeParticipants.push({
                                    list: participantList,
                                    file: file
                                });
                            }
                        }
                        self.issues = self.issues.concat(issues);
                        process.nextTick(cb);
                    });
                });
            }

            // validate bvec
            else if (file.name && file.name.endsWith('.bvec')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        process.nextTick(cb);
                        return;
                    }
                    bContentsDict[file.relativePath] = contents;
                    bvec(file, contents, function (issues) {
                        self.issues = self.issues.concat(issues);
                        process.nextTick(cb);
                    });
                });
            }

            // validate bval
            else if (file.name && file.name.endsWith('.bval')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        process.nextTick(cb);
                        return;
                    }
                    bContentsDict[file.relativePath] = contents;
                    bval(file, contents, function (issues) {
                        self.issues = self.issues.concat(issues);
                        process.nextTick(cb);
                    });
                });
            }

            // validate json
            else if (file.name && file.name.endsWith('.json')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        process.nextTick(cb);
                        return;
                    }
                    json(file, contents, function (issues, jsObj) {
                        self.issues = self.issues.concat(issues);

                        // abort further tests if schema test does not pass
                        for (var i = 0; i < issues.length; i++) {
                            if (issues[i].severity === 'error') {
                                process.nextTick(cb);
                                return;
                            }
                        }

                        jsonContentsDict[file.relativePath] = jsObj;

                        // collect task summary
                        if (file.name.indexOf('task') > -1) {
                            var task = jsObj ? jsObj.TaskName : null;
                            if (task && summary.tasks.indexOf(task) === -1) {
                                summary.tasks.push(task);
                            }
                        }
                        process.nextTick(cb);
                    });
                });
            } else {
                process.nextTick(cb);
            }

            // collect file stats
            if (typeof window !== 'undefined') {
                if (file.size) {
                    summary.size += file.size;
                }
            } else {
                if (!file.stats) {
                    try {
                        file.stats = fs.statSync(file.path);
                    } catch (err) {
                        file.stats = {size: 0};
                    }
                }
                summary.size += file.stats.size;
            }

            // collect sessions & subjects
            if (!utils.type.isAssociatedData(file.relativePath) && utils.type.isBIDS(file.relativePath)) {
                var pathValues = utils.type.getPathValues(file.relativePath);

                if (pathValues.sub && summary.subjects.indexOf(pathValues.sub) === -1) {
                    summary.subjects.push(pathValues.sub);
                }
                if (pathValues.ses && summary.sessions.indexOf(pathValues.ses) === -1) {
                    summary.sessions.push(pathValues.ses);
                }
            }

        }, function () {
            async.eachOfLimit(niftis, 200, function (file, key, cb) {
                if (self.options.ignoreNiftiHeaders) {
                    NIFTI(null, file, jsonContentsDict, bContentsDict, fileList, events, function (issues) {
                        self.issues = self.issues.concat(issues);
                        process.nextTick(cb);
                    });
                } else {
                    utils.files.readNiftiHeader(file, function (header) {
                        // check if header could be read
                        if (header && header.hasOwnProperty('error')) {
                            self.issues.push(header.error);
                            process.nextTick(cb);
                        } else {
                            headers.push([file, header]);
                            NIFTI(header, file, jsonContentsDict, bContentsDict, fileList, events, function (issues) {
                                self.issues = self.issues.concat(issues);
                                process.nextTick(cb);
                            });
                        }
                    });
                }

            }, function () {
                if (!hasSubjectDir) {
                    self.issues.push(new Issue({code: 45}));
                }
                // check if participants file match found subjects

                if (participants) {
                    var participantsFromFile = participants.list.sort();
                    var participantsFromFolders = summary.subjects.sort();
                    if (!utils.array.equals(participantsFromFolders, participantsFromFile, true)) {
                        self.issues.push(new Issue({
                            code: 49,
                            evidence: "participants.tsv: " + participantsFromFile.join(', ') + " folder structure: " + participantsFromFolders.join(', '),
                            file: participants.file
                        }));
                    }
                }

                // check if dataset contains T1w
                if (summary.modalities.indexOf('T1w') < 0) {
                    self.issues.push(new Issue({
                        code: 53
                    }));
                }

                if (phenotypeParticipants && phenotypeParticipants.length > 0) {
                    for (var j = 0; j < phenotypeParticipants.length; j++) {
                        var fileParticpants = phenotypeParticipants[j];
                        var diff = utils.array.diff(fileParticpants.list, summary.subjects)[0];
                        if (diff && diff.length > 0) {
                            self.issues.push(new Issue({
                                code: 51,
                                evidence: 'sub-' + diff.join(', sub-'),
                                file: fileParticpants.file
                            }));
                        }
                    }
                }
                self.issues = self.issues.concat(headerFields(headers));
                self.issues = self.issues.concat(session(fileList));
                summary.modalities = utils.modalities.group(summary.modalities);
                var issues = utils.issues.format(self.issues, summary, self.options);
                callback(issues, summary);
            });
        });
    },

    /**
     * Reset
     *
     * Resets the in object data back to original values.
     */
    reset: function () {
        this.issues = [];
    }

};

module.exports = BIDS;
