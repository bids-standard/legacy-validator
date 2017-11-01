var assert   = require('assert');
var validate = require('../index');

describe('NIFTI', function(){

    var file = {
        name: 'sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz',
        relativePath: '/sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz'
    };
    var jsonContentsDict = {
        '/sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.json': {
            EchoTime: 1,
            PhaseEncodingDirection: 3,
            EffectiveEchoSpacing: 5,
            SliceTiming: 3,
            SliceEncodingDirection: 4,
            RepetitionTime: 1,
            TotalReadoutTime: 3,
            TaskName: 'Mixed Event Related Probe'
        }
    };
    var events = [
        '/sub-15/func/sub-14_task-mixedeventrelatedprobe_run-01_events.tsv',
        '/sub-15/run-01_events.tsv'
    ];

    it('should warn user about misisng events file', function() {
        validate.NIFTI(null, file, jsonContentsDict, {}, [], events, function (issues) {
            assert(issues.length = 1 && issues[0].code == 25);
        });
    });

    it('should ignore missing events files for rest scans', function() {
        jsonContentsDict['/sub-15/func/sub-15_task-mixedeventrelatedproberest_run-01_bold.json'] = jsonContentsDict['/sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.json'];
        file.relativePath = '/sub-15/func/sub-15_task-mixedeventrelatedproberest_run-01_bold.nii.gz';
        validate.NIFTI(null, file, jsonContentsDict, {}, [], events, function (issues) {
            assert.deepEqual(issues, []);
        });
    });

    it('should catch mismatched numbers of volumes in dwi scan and .bval/.bvec files', function() {
        var file = {
            name: 'sub-09_ses-test_dwi.nii.gz',
            path: '/ds114/sub-09/ses-test/dwi/sub-09_ses-test_dwi.nii.gz',
            relativePath: '/sub-09/ses-test/dwi/sub-09_ses-test_dwi.nii.gz'
        };
        var header = {
            dim: [ 4, 128, 128, 72, 71 ],
            pixdim: [ -1, 2, 2, 2, 16.5 ],
            xyzt_units: [ 'mm', 'mm', 'mm', 's' ]
        };
        jsonContentsDict['/sub-09/ses-test/dwi/sub-09_ses-test_dwi.json'] = jsonContentsDict['/sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.json'];
        var bContentsDict = {
            '/dwi.bval': '0 0 0 0 0 0 0 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000 1000\n',
            '/dwi.bvec': '0 0 0 0 0 0 0 -1 -0.002 0.026 -0.591 0.236 0.893 -0.796 -0.234 -0.936 -0.506 -0.346 -0.457 0.487 0.618 0.577 0.827 -0.894 -0.29 -0.116 0.8 -0.514 0.789 -0.949 -0.233 0.021 -0.217 -0.774 0.161 0.147 -0.888 0.562 0.381 0.306 0.332 0.963 0.959 -0.453 0.773 -0.709 0.693 -0.682 0.142 0.74 0.103 -0.584 0.088 0.552 -0.838 -0.363 0.184 0.721 -0.433 -0.502 0.171 -0.463 -0.385 0.713 -0.26 -0.001 -0.037 -0.57 0.282 -0.721 -0.267 \n0 0 0 0 0 0 0 0 1 0.649 -0.766 -0.524 -0.259 0.129 0.93 0.14 -0.845 -0.847 -0.631 -0.389 0.673 -0.105 -0.521 -0.04 -0.541 -0.963 0.403 0.84 0.153 -0.233 0.783 -0.188 -0.956 -0.604 0.356 0.731 0.417 0.232 0.143 -0.199 -0.13 -0.265 0.205 -0.889 0.628 0.408 0.024 0.529 -0.725 0.388 0.822 -0.596 -0.335 -0.792 -0.458 -0.561 0.392 -0.693 0.682 0.69 -0.509 0.423 -0.809 -0.247 0.885 0.077 -0.902 -0.303 0.145 0.608 0.96 \n0 0 0 0 0 0 0 0 0 0.76 0.252 0.818 0.368 0.591 0.284 0.324 -0.175 -0.402 -0.627 0.782 0.407 -0.81 0.213 -0.447 -0.789 -0.245 -0.444 0.174 -0.596 0.211 0.577 -0.982 0.199 0.19 0.921 -0.666 0.193 -0.794 0.914 -0.931 0.934 0.044 0.193 0.068 0.088 0.575 0.721 -0.506 0.674 0.549 0.56 0.551 0.938 0.259 -0.296 0.744 -0.901 0.009 -0.589 0.521 -0.844 0.779 0.444 0.656 -0.387 -0.997 0.43 -0.763 -0.948 0.332 -0.085 \n'
        };
        validate.NIFTI(header, file, jsonContentsDict, bContentsDict, [], [], function (issues) {
            assert(issues.length == 1 && issues[0].code == 29);
        });
    });

    it('should catch missing .bval an .bvec files', function() {
        var file = {
            name: 'sub-09_ses-test_dwi.nii.gz',
            path: '/ds114/sub-09/ses-test/dwi/sub-09_ses-test_dwi.nii.gz',
            relativePath: '/sub-09/ses-test/dwi/sub-09_ses-test_dwi.nii.gz'
        };
        validate.NIFTI(null, file, jsonContentsDict, {}, [], [], function (issues) {
            assert(issues.length == 2 && issues[0].code == 32 && issues[1].code == 33);
        });
    });

    it('should catch missing task name definitions on task scans', function() {
        delete jsonContentsDict['/sub-15/func/sub-15_task-mixedeventrelatedproberest_run-01_bold.json'].TaskName;
        validate.NIFTI(null, file, jsonContentsDict, {}, [], events, function (issues) {
            assert(issues.length = 1 && issues[0].code == 50);
        });
    });

    it('should ignore missing task name definitions on sbref task scans', function() {
        var file = {
            name: 'sub-15_task-mixedeventrelatedprobe_acq-LR_sbref.nii.gz',
            relativePath: '/sub-15/func/sub-15_task-mixedeventrelatedprobe_acq-LR_sbref.nii.gz'
        };
        jsonContentsDict[file.relativePath.replace('.nii.gz', '.json')] = jsonContentsDict['/sub-15/func/sub-15_task-mixedeventrelatedproberest_run-01_bold.json'];
        validate.NIFTI(null, file, jsonContentsDict, {}, [], events, function (issues) {
            assert.deepEqual(issues, []);
        });
    });

    it('should generate warning if files listed in IntendedFor of fieldmap json do not exist', function() {
      var file = {
          name: 'sub-09_ses-test_run-01_fieldmap.nii.gz',
          path: '/ds114/sub-09/ses-test/dwi/sub-09_ses-test_run-01_fieldmap.nii.gz',
          relativePath: '/sub-09/ses-test/dwi/sub-09_ses-test_run-01_fieldmap.nii.gz'
      };

      var jsonContentsDict = {
          '/sub-09/ses-test/dwi/sub-09_ses-test_run-01_fieldmap.json': {
              TaskName: 'Mixed Event Related Probe',
              IntendedFor: ['func/sub-15_task-mixedeventrelatedprobe_run-05_bold.nii.gz','func/sub-15_task-mixedeventrelatedprobe_run-02_bold.nii.gz'
            ]
          }
        };
      var fileList = [];
      fileList.push({ name:'sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz',
        path: 'sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz',
        relativePath: '/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz'});
      validate.NIFTI(null, file, jsonContentsDict, {}, [], [], function (issues) {
          assert(issues.length = 2 && issues[0].code == 17  && issues[1].code == 37);
      });
    });

    it('should not generate warning if files listed in IntendedFor of fieldmap json exist', function() {
      var file = {
          name: 'sub-15_ses-test_run-01_fieldmap.nii.gz',
          path: '/ds114/sub-15/ses-test/dwi/sub-15_ses-test_run-01_fieldmap.nii.gz',
          relativePath: '/sub-15/ses-test/dwi/sub-15_ses-test_run-01_fieldmap.nii.gz'
      };

      var jsonContentsDict = {
          '/sub-15/ses-test/dwi/sub-15_ses-test_run-01_fieldmap.json': {
              TaskName: 'Mixed Event Related Probe',
              Units: 'rad/s',
              IntendedFor: ['func/sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz'
            ]
          }
        };

      var fileList = [{ name:'sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz',
        path: 'sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz',
        relativePath: '/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz'}];
      validate.NIFTI(null, file, jsonContentsDict, {}, fileList, [], function (issues) {
          assert.deepEqual(issues, []);
      });
    });

    it('SliceTiming should not be greater than RepetitionTime', function(){
        var jsonContentsDict_new = {
            '/sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.json': {
                "RepetitionTime": 1.5,
                "TaskName": "AntiSaccade (AS) Rewarded & Neutral with varying dot position",
                "EchoTime": 0.025,
                "NumberofPhaseEncodingSteps": 64,
                "FlipAngle": 70,
                "PhaseEncodingDirection": "j",
                "SliceTiming": [
                    0.0,
                    1.3448,
                    1.6207,
                    1.3966,
                    0.6724,
                    1.4483,
                    1.7241
                ]
            }
        };
        var file_new = {
            name: 'sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz',
            relativePath: '/sub-15/func/sub-15_task-mixedeventrelatedprobe_run-01_bold.nii.gz'
        };
        var events = [
            '/sub-15/func/sub-14_task-mixedeventrelatedprobe_run-01_events.tsv',
            '/sub-15/run-01_events.tsv'
        ];
        validate.NIFTI(null, file_new, jsonContentsDict_new, {}, [], events, function (issues) {
            assert(issues[1].code === 66 && issues.length === 2);
        });
    });

});
