var async  = require('async');
var fs     = require('fs');
var utils  = require('../utils');

var TSV    = require('./tsv');
var json   = require('./json');
var NIFTI  = require('./nii');
var bval   = require('./bval');
var bvec   = require('./bvec');
var session = require('./session');
var headerFields = require('./headerFields');

var BIDS = {

    options:  {},
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
        self.options = options ? self.parseOptions(options) : {};
        BIDS.reset();
        utils.files.readDir(dir, function (files) {
            self.quickTest(files, function (couldBeBIDS) {
                if (couldBeBIDS) {
                    self.fullTest(files, callback);
                } else {
                    callback('Invalid');
                }
            });
        });
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
            bContentsDict    = {},
            events           = [],
            niftis           = [],
            headers          = [],
            participants     = null,
            hasSubjectDir    = false;

        var summary = {
            sessions: [],
            subjects: [],
            tasks:    [],
            modalities: [],
            totalFiles: Object.keys(fileList).length,
            size: 0
        };

        // validate individual files
        async.forEachOf(fileList, function (file, key, cb) {
            var path = utils.files.relativePath(file);
            file.relativePath = path;

            // check for subject directory presence
            if (path.startsWith('/sub-')) {hasSubjectDir = true;}

            // ignore associated data
            if (utils.type.isAssociatedData(file.relativePath)) {cb();}

            // validate path naming
            else if (!utils.type.isBIDS(file.relativePath)) {
                self.issues.push(new utils.Issue({
                    file: file,
                    evidence: file.name,
                    code: 1
                }));
                cb();
            }

            // capture niftis for later validation
            else if (file.name.endsWith('.nii') || file.name.endsWith('.nii.gz')) {
                niftis.push(file);

                // collect modality summary
                var pathParts = path.split('_');
                var suffix    = pathParts[pathParts.length -1];
                    suffix    = suffix.slice(0, suffix.indexOf('.'));
                if (summary.modalities.indexOf(suffix) === -1) {summary.modalities.push(suffix);}

                cb();
            }


            // validate tsv
            else if (file.name && file.name.endsWith('.tsv')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        cb();
                        return;
                    }
                    if (file.name.endsWith('_events.tsv')) {events.push(file.relativePath);}
                    TSV(file, contents, function (issues, participantList) {
                        if (participantList) {
                            participants = {
                                list: participantList,
                                file: file
                            };
                        }
                        self.issues = self.issues.concat(issues);
                        cb();
                    });
                });
            }

            // validate bvec
            else if (file.name && file.name.endsWith('.bvec')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        cb();
                        return;
                    }
                    bContentsDict[file.relativePath] = contents;
                    bvec(file, contents, function (issues) {
                        self.issues = self.issues.concat(issues);
                        cb();
                    });
                });
            }

            // validate bval
            else if (file.name && file.name.endsWith('.bval')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        cb();
                        return;
                    }
                    bContentsDict[file.relativePath] = contents;
                    bval(file, contents, function (issues) {
                        self.issues = self.issues.concat(issues);
                        cb();
                    });
                });
            }

            // validate json
            else if (file.name && file.name.endsWith('.json')) {
                utils.files.readFile(file, function (issue, contents) {
                    if (issue) {
                        self.issues.push(issue);
                        cb();
                        return;
                    }
                    json(file, contents, function (issues, jsObj) {
                        self.issues = self.issues.concat(issues);
                        jsonContentsDict[file.relativePath] = jsObj;

                        // collect task summary
                        if (file.name.indexOf('task') > -1) {
                            var task = jsObj ? jsObj.TaskName : null;
                            if (task && summary.tasks.indexOf(task) === -1) {
                                summary.tasks.push(task);
                            }
                        }
                        cb();
                    });
                });
            } else {
                cb();
            }

            // collect file stats
            if (typeof window !== 'undefined') {
                if (file.size) {summary.size += file.size;}
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

            // collect sessions subjects
            if (!utils.type.isAssociatedData(file.relativePath)) {
                var checks = {'ses':  'sessions', 'sub':  'subjects'};
                for (var checkKey in checks) {
                    if (path && path.indexOf(checkKey + '-') > -1) {
                        var item = path.slice(path.indexOf(checkKey + '-'));
                            item = item.slice(0, item.indexOf('/'));
                            if (item.indexOf('_') > -1) {item = item.slice(0, item.indexOf('_'));}
                            item = item.slice(checkKey.length + 1);
                        if (summary[checks[checkKey]].indexOf(item) === -1) {summary[checks[checkKey]].push(item);}
                    }
                }
            }

        }, function () {
            async.forEachOf(niftis, function (file, key, cb) {
                if (self.options.ignoreNiftiHeaders) {
                    NIFTI(null, file, jsonContentsDict, bContentsDict, fileList, events, function (issues) {
                        self.issues = self.issues.concat(issues);
                        cb();
                    });
                } else {
                    utils.files.readNiftiHeader(file, function (header) {
                        // check if header could be read
                        if (header && header.hasOwnProperty('error')) {
                            self.issues.push(header.error);
                            cb();
                        } else {
                            headers.push([file, header]);
                            NIFTI(header, file, jsonContentsDict, bContentsDict, fileList, events, function (issues) {
                                self.issues = self.issues.concat(issues);
                                cb();
                            });
                        }
                    });
                }

            }, function () {
                if (!hasSubjectDir) {self.issues.push(new utils.Issue({code: 45}));}
                // check if participants file match found subjects
                if (participants && !utils.array.equals(summary.subjects, participants.list, true)) {
                    self.issues.push(new utils.Issue({
                        code: 49,
                        evidence: summary.subjects.toString() +" is not \n" + participants.list.toString(),
                        file: participants.file
                    }));
                }
                self.issues = self.issues.concat(headerFields(headers));
                self.issues = self.issues.concat(session(fileList));
                var issues  = self.formatIssues(self.issues);
                summary.modalities = self.groupModalities(summary.modalities);
                //remove fieldmap related warnings if no fieldmaps are present
                if (summary.modalities.indexOf("fieldmap") < 0) {
                    var filteredWarnings = [];
                    var fieldmapRelatedCodes = ["6", "7", "8", "9"];
                    for (var i = 0; i < issues.warnings.length; i++) {
                        if (fieldmapRelatedCodes.indexOf(issues.warnings[i].code) < 0) {
                            filteredWarnings.push(issues.warnings[i]);
                        }
                    }
                    issues.warnings = filteredWarnings;
                }
                callback(issues.errors, issues.warnings, summary);
            });
        });
    },

    /**
     * Format Issues
     */
    formatIssues: function () {
        var errors = [], warnings = [];

        // sort alphabetically by relative path of files
        this.issues.sort(function (a,b) {
            var aPath = a.file ? a.file.relativePath : '';
            var bPath = b.file ? b.file.relativePath : '';
            return (aPath > bPath) ? 1 : ((bPath > aPath) ? -1 : 0);
        });

        // organize by issue code
        var categorized = {};
        for (var i = 0; i < this.issues.length; i++) {
            var issue = this.issues[i];
            if (!categorized[issue.code]) {
                categorized[issue.code] = utils.issues[issue.code];
                categorized[issue.code].files = [];
                categorized[issue.code].additionalFileCount = 0;
            }
            if (this.options.verbose || (categorized[issue.code].files.length < 10)) {
                categorized[issue.code].files.push(issue);
            } else {
                categorized[issue.code].additionalFileCount++;
            }
        }

        // organize by severity
        for (var key in categorized) {
            issue = categorized[key];
            issue.code = key;

            if (issue.severity === 'error') {
                errors.push(issue);
            } else if (issue.severity === 'warning' && !this.options.ignoreWarnings) {
                warnings.push(issue);
            }

        }

        return {errors: errors, warnings: warnings};
    },

    /**
     * Group Modalities
     *
     * Takes an array of modalities and looks for
     * groupings defined in 'modalityGroups' and
     * replaces any perfectly matched groupings with
     * the grouping object key.
     */
    groupModalities: function (modalities) {

        var modalityGroups = [
            [[
                'magnitude1',
                'magnitude2',
                'phase1',
                'phase2'
            ], "fieldmap"],
            [[
                'magnitude1',
                'magnitude2',
                'phasediff'
            ], "fieldmap"],
            [[
                'magnitude',
                'fieldmap'
            ], "fieldmap"],
            [['epi'], "fieldmap"]
        ];

        for (var groupTouple_i = 0; groupTouple_i < modalityGroups.length; groupTouple_i++) {
            var groupSet = modalityGroups[groupTouple_i][0];
            var groupName = modalityGroups[groupTouple_i][1];
            var match = true;
            for (var i = 0; i < groupSet.length; i++) {
                if (modalities.indexOf(groupSet[i]) === -1) {
                    match = false;
                }
            }
            if (match) {
                modalities.push(groupName);
                for (var j = 0; j < groupSet.length; j++) {
                    modalities.splice(modalities.indexOf(groupSet[j]), 1);
                }
            }
        }

        return modalities;
    },

    /**
     * Reset
     *
     * Resets the in object data back to original values.
     */
    reset: function () {
        this.issues = [];
    },

    /**
     * Parse Options
     */
    parseOptions: function (options) {
        return {
            ignoreWarnings:     options.ignoreWarnings     ? true : false,
            ignoreNiftiHeaders: options.ignoreNiftiHeaders ? true : false,
            verbose:            options.verbose            ? true : false
        };
    }
};

module.exports = BIDS;
