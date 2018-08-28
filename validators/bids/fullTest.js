var async = require('async')

var utils = require('../../utils')
var TSV = require('../tsv')
var json = require('../json')
var NIFTI = require('../nii')
var bval = require('../bval')
var bvec = require('../bvec')
var Events = require('../events')
var session = require('../session')
var checkAnyDataPresent = require('../checkAnyDataPresent')
var headerFields = require('../headerFields')
var mismatchTest = require('./sesMismatch')
var Issue = utils.issues.Issue

/**
 * Full Test
 *
 * Takes on an array of files and starts
 * the validation process for a BIDS
 * package.
 */
function fullTest(BIDS, fileList, callback) {
  var self = BIDS

  var jsonContentsDict = {},
    bContentsDict = {},
    events = [],
    stimuli = {
      events: [],
      directory: [],
    },
    niftis = [],
    ephys = [],
    headers = [],
    participants = null,
    phenotypeParticipants = [],
    hasSubjectDir = false
  var hasDatasetDescription = false

  var summary = {
    sessions: [],
    subjects: [],
    tasks: [],
    modalities: [],
    totalFiles: Object.keys(fileList).length,
    size: 0,
  }

  // collect file directory statistics
  utils.files.collectDirectoryStatistics(fileList, summary)

  // remove ignored files from list:
  Object.keys(fileList).forEach(function(key) {
    if (fileList[key].ignore) {
      delete fileList[key]
    }
  })

  // var subses_mismatch = false;
  mismatchTest(BIDS, fileList)

  // check for illegal character in task name and acq name
  utils.files.illegalCharacterTest(fileList, self.issues)

  // validate individual files
  async.eachOfLimit(
    fileList,
    200,
    function(file, key, cb) {
      const path = file.relativePath
      const pathParts = path.split('_')
      const suffix = pathParts[pathParts.length - 1]

      // Make RegExp for detecting modalities from data file extensions
      var dataExtRE = new RegExp(
        [
          '^.*\\.(',
          'nii|nii\\.gz|', // MRI
          'fif|fif\\.gz|sqd|con|kdf|chn|trg|raw|raw\\.mhf|', // MEG
          'eeg|vhdr|vmrk|edf|cnt|bdf|set|fdt|dat|nwb|tdat|tidx|tmet', // EEG/iEEG
          ')$',
        ].join(''),
      )

      // ignore associated data
      if (utils.type.file.isStimuliData(file.relativePath)) {
        stimuli.directory.push(file)
        process.nextTick(cb)
      }

      // validate path naming
      else if (
        !utils.type.isBIDS(
          file.relativePath,
          BIDS.options.bep006,
          BIDS.options.bep010,
        )
      ) {
        self.issues.push(
          new Issue({
            file: file,
            evidence: file.name,
            code: 1,
          }),
        )
        process.nextTick(cb)
      }

      // check modality by data file extension ...
      // and capture data files for later sanity checks (when available)
      else if (dataExtRE.test(file.name)) {
        // capture nifties for later validation
        if (file.name.endsWith('.nii') || file.name.endsWith('.nii.gz')) {
          niftis.push(file)
        }

        // collect modality summary
        const modality = suffix.slice(0, suffix.indexOf('.'))
        if (summary.modalities.indexOf(modality) === -1) {
          summary.modalities.push(modality)
        }

        process.nextTick(cb)
      }

      // capture ieeg files for summary
      else if (
        [
          'edf',
          'vhdr',
          'vmrk',
          'dat',
          'cnt',
          'bdf',
          'set',
          'nwb',
          'tdat',
          'tidx',
          'tmet',
        ].includes(file.name.split('.').pop())
      ) {
        ephys.push(file)

        process.nextTick(cb)
      }

      // validate tsv
      else if (file.name && file.name.endsWith('.tsv')) {
        // Generate name for corresponding data dictionary file
        //console.log("Check for data dictionary for " + file.path);
        let dict_path = file.relativePath.replace('.tsv', '.json')
        let exists = false
        let potentialDicts = utils.files.potentialLocations(dict_path)
        // Need to check for .json file at all levels of heirarchy
        //console.log("Potential data dictionaries:" + utils.files.potentialLocations(dict_path));
        // Get list of fileList keys
        let idxs = Object.keys(fileList)
        for (let i of idxs) {
          if (potentialDicts.indexOf(fileList[i].relativePath) > -1) {
            exists = true
            break
          }
        }

        // Check if data dictionary file exists
        if (!exists) {
          // Can't use fs.exists because there's no file system in browser implementations
          //console.log("Missing data dictionary found");
          self.issues.push(
            new Issue({
              code: 82,
              file: file,
            }),
          )
        }
        utils.files.readFile(file, function(issue, contents) {
          if (issue) {
            self.issues.push(issue)
            process.nextTick(cb)
            return
          }
          if (file.name.endsWith('_events.tsv')) {
            events.push({
              file: file,
              path: file.relativePath,
              contents: contents,
            })
          }
          TSV.TSV(file, contents, fileList, function(
            issues,
            participantList,
            stimFiles,
          ) {
            if (participantList) {
              if (file.name.endsWith('participants.tsv')) {
                participants = {
                  list: participantList,
                  file: file,
                }
              } else if (file.relativePath.includes('phenotype/')) {
                phenotypeParticipants.push({
                  list: participantList,
                  file: file,
                })
              }
            }
            if (stimFiles.length) {
              // add unique new events to the stimuli.events array
              stimuli.events = [...new Set([...stimuli.events, ...stimFiles])]
            }
            self.issues = self.issues.concat(issues)
            process.nextTick(cb)
          })
        })
      }

      // validate bvec
      else if (file.name && file.name.endsWith('.bvec')) {
        bvec.validate(file, bContentsDict, self.issues, () => {
          process.nextTick(cb)
        })
      }

      // validate bval
      else if (file.name && file.name.endsWith('.bval')) {
        bval.validate(file, bContentsDict, self.issues, () => {
          process.nextTick(cb)
        })
      }

      // validate json
      else if (file.name && file.name.endsWith('.json')) {
        utils.files.readFile(file, function(issue, contents) {
          if (issue) {
            self.issues.push(issue)
            process.nextTick(cb)
            return
          }
          json(file, contents, function(issues, jsObj) {
            self.issues = self.issues.concat(issues)

            // abort further tests if schema test does not pass
            for (var i = 0; i < issues.length; i++) {
              if (issues[i].severity === 'error') {
                process.nextTick(cb)
                return
              }
            }

            jsonContentsDict[file.relativePath] = jsObj

            // collect task summary
            if (file.name.indexOf('task') > -1) {
              var task = jsObj ? jsObj.TaskName : null
              if (task && summary.tasks.indexOf(task) === -1) {
                summary.tasks.push(task)
              }
            }
            process.nextTick(cb)
          })
        })
      } else {
        process.nextTick(cb)
      }

      // check for subject directory presence
      if (path.startsWith('/sub-')) {
        hasSubjectDir = true
      }

      // check for dataset_description.json presence
      if (path === '/dataset_description.json') {
        hasDatasetDescription = true
      }

      // collect sessions & subjects
      if (
        !utils.type.file.isStimuliData(file.relativePath) &&
        utils.type.isBIDS(
          file.relativePath,
          BIDS.options.bep006,
          BIDS.options.bep010,
        )
      ) {
        var pathValues = utils.type.getPathValues(file.relativePath)

        if (pathValues.sub && summary.subjects.indexOf(pathValues.sub) === -1) {
          summary.subjects.push(pathValues.sub)
        }
        if (pathValues.ses && summary.sessions.indexOf(pathValues.ses) === -1) {
          summary.sessions.push(pathValues.ses)
        }
      }
    },
    function() {
      // check if same file with .nii and .nii.gz extensions is present
      var niftiCounts = niftis
        .map(function(val) {
          return { count: 1, val: val.name.split('.')[0] }
        })
        .reduce(function(a, b) {
          a[b.val] = (a[b.val] || 0) + b.count
          return a
        }, {})

      var duplicates = Object.keys(niftiCounts).filter(function(a) {
        return niftiCounts[a] > 1
      })
      if (duplicates.length !== 0) {
        for (var key in duplicates) {
          var duplicateFiles = niftis.filter(function(a) {
            return a.name.split('.')[0] === duplicates[key]
          })
          for (var file in duplicateFiles) {
            self.issues.push(
              new Issue({
                code: 74,
                file: duplicateFiles[file],
              }),
            )
          }
        }
      }

      async.eachOfLimit(
        niftis,
        200,
        function(file, key, cb) {
          if (self.options.ignoreNiftiHeaders) {
            NIFTI(
              null,
              file,
              jsonContentsDict,
              bContentsDict,
              fileList,
              events,
              function(issues) {
                self.issues = self.issues.concat(issues)
                process.nextTick(cb)
              },
            )
          } else {
            utils.files.readNiftiHeader(file, function(header) {
              // check if header could be read
              if (header && header.hasOwnProperty('error')) {
                self.issues.push(header.error)
                process.nextTick(cb)
              } else {
                headers.push([file, header])
                NIFTI(
                  header,
                  file,
                  jsonContentsDict,
                  bContentsDict,
                  fileList,
                  events,
                  function(issues) {
                    self.issues = self.issues.concat(issues)
                    process.nextTick(cb)
                  },
                )
              }
            })
          }
        },
        function() {
          if (!hasSubjectDir) {
            self.issues.push(new Issue({ code: 45 }))
          }
          if (!hasDatasetDescription) {
            self.issues.push(new Issue({ code: 57 }))
          }
          // check if participants file match found subjects
          if (participants) {
            var participantsFromFile = participants.list.sort()
            var participantsFromFolders = summary.subjects.sort()
            if (
              !utils.array.equals(
                participantsFromFolders,
                participantsFromFile,
                true,
              )
            ) {
              self.issues.push(
                new Issue({
                  code: 49,
                  evidence:
                    'participants.tsv: ' +
                    participantsFromFile.join(', ') +
                    ' folder structure: ' +
                    participantsFromFolders.join(', '),
                  file: participants.file,
                }),
              )
            }
          }

          // check if dataset contains T1w
          if (summary.modalities.indexOf('T1w') < 0) {
            self.issues.push(
              new Issue({
                code: 53,
              }),
            )
          }

          //check for equal number of participants from ./phenotype/*.tsv and participants in dataset
          TSV.checkphenotype(phenotypeParticipants, summary, self.issues)

          // validate nii header fields
          self.issues = self.issues.concat(headerFields(headers))

          // Events validation
          Events.validateEvents(
            events,
            stimuli,
            headers,
            jsonContentsDict,
            self.issues,
          )

          // validation session files
          self.issues = self.issues.concat(session(fileList))

          self.issues = self.issues.concat(
            checkAnyDataPresent(fileList, summary.subjects),
          )
          summary.modalities = utils.modalities.group(summary.modalities)
          var issues = utils.issues.format(self.issues, summary, self.options)
          callback(issues, summary)
        },
      )
    },
  )
}

module.exports = fullTest
