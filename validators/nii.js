var utils = require('../utils');
var Issue = utils.issues.Issue;

function checkIfIntendedExists(intendedForFile, fileList, issues, file) {
    var intendedForFileFull = "/" + file.relativePath.split("/")[1] + "/" + intendedForFile;
    var onTheList = false;

    for (var key2 in fileList) {
        var filePath = fileList[key2].relativePath;
        if (filePath === intendedForFileFull) {
            onTheList = true;
        }
    }
    if (!onTheList) {
        issues.push(new Issue({
            file: file,
            code: 37,
            reason: "'IntendedFor' property of this fieldmap  ('" + file.relativePath +
            "') does not point to an existing file('" + intendedForFile + "'). Please mind that this value should not include subject level directory " +
            "('/" + file.relativePath.split("/")[1] + "/').",
            evidence: intendedForFile
        }));
    }
}

/**
 * NIFTI
 *
 * Takes a NifTi header, a file path and a callback
 * as arguments. And calls back with any issues
 * it finds while validating against the BIDS
 * specification.
 */
module.exports = function NIFTI (header, file, jsonContentsDict, bContentsDict, fileList, events, callback) {
    var path = file.relativePath;
    var issues = [];
    var potentialSidecars = potentialLocations(path.replace(".gz", "").replace(".nii", ".json"));
    var potentialEvents   = potentialLocations(path.replace(".gz", "").replace("bold.nii", "events.tsv"));
    var mergedDictionary  = generateMergedSidecarDict(potentialSidecars, jsonContentsDict);
    var sidecarMessage    = "It can be included one of the following locations: " + potentialSidecars.join(", ");
    var eventsMessage     = "It can be included one of the following locations: " + potentialEvents.join(", ");

    if (path.includes('_dwi.nii')) {
        var potentialBvecs = potentialLocations(path.replace(".gz", "").replace(".nii", ".bvec"));
        var potentialBvals = potentialLocations(path.replace(".gz", "").replace(".nii", ".bval"));
        var bvec = getBFileContent(potentialBvecs, bContentsDict);
        var bval = getBFileContent(potentialBvals, bContentsDict);
        var bvecMessage = "It can be included in one of the following locations: " + potentialBvecs.join(", ");
        var bvalMessage = "It can be included in one of the following locations: " + potentialBvals.join(", ");

        if (!bvec) {
            issues.push(new Issue({
                code: 32,
                file: file,
                reason: '_dwi scans should have a corresponding .bvec file. ' + bvecMessage
            }));
        }
        if (!bval) {
            issues.push(new Issue({
                code: 33,
                file: file,
                reason: '_dwi scans should have a corresponding .bval file. ' + bvalMessage
            }));
        }

        if (bval && bvec && header){
        /*
        bvec length ==3 is checked at bvec.spec.js hence following if loop doesnot have else block
        */
            if (bvec.replace(/^\s+|\s+$/g, '').split('\n').length === 3){
              var volumes = [
                  bvec.split('\n')[0].replace(/^\s+|\s+$/g, '').split(' ').length, // bvec row 1 length
                  bvec.split('\n')[1].replace(/^\s+|\s+$/g, '').split(' ').length, // bvec row 2 length
                  bvec.split('\n')[2].replace(/^\s+|\s+$/g, '').split(' ').length, // bvec row 3 length
                  bval.replace(/^\s+|\s+$/g, '').split(' ').length,                // bval row length
                  header.dim[4]                                                    // header 4th dimension
              ];

              if (!volumes.every(function(v) { return v === volumes[0]; })) {
                  issues.push(new Issue({
                      code: 29,
                      file: file
                  }));
              }
            }
          }
    }

    if (missingEvents(path, potentialEvents, events)) {
        issues.push(new Issue({
            code: 25,
            file: file,
            reason: 'Task scans should have a corresponding events.tsv file. ' + eventsMessage
        }));
    }

    if (header) {
        // Define repetition time from header and coerce to seconds.
        var repetitionTime = header.pixdim[4];
        var repetitionUnit = header.xyzt_units && header.xyzt_units[3] ? header.xyzt_units[3] : null;
        if (repetitionUnit === 'ms') {repetitionTime = repetitionTime / 1000;    repetitionUnit = 's';}
        if (repetitionUnit === 'us') {repetitionTime = repetitionTime / 1000000; repetitionUnit = 's';}
    }

    if (!mergedDictionary.invalid) {
            
          /*
          check if the metadata required by BIDS2NDA are missing
          */
          //function for checking if the filepath include the suffix
          function checkIfPathInclude(){
            return (path.includes("_bold.nii") || path.includes("_fieldmap.nii") || path.includes("_epi.nii") || path.includes("_T2w.nii") || checkIfPathInclude2());
          }
          function checkIfPathInclude2(){
            return (path.includes("_dwi.nii") || path.includes("_phase1.nii") || path.includes("_phase2.nii") || path.includes("_T1w.nii") || checkIfPathInclude3());
          }
          function checkIfPathInclude3(){
            return (path.includes("_phasediff.nii") || path.includes("_magnitude1.nii") || path.includes("_magnitude2.nii") || path.includes("_PD.nii"));
          }

          if (checkIfPathInclude()) {
            //for files with bold in the suffix
              function checkHasOwnProperty(){
                return (!mergedDictionary.hasOwnProperty('Manufacturer') && checkHasOwnProperty2() && !mergedDictionary.hasOwnProperty('ManufacturersModelName') && !mergedDictionary.hasOwnProperty('HardcopyDeviceSoftwareVersion'));
              }
              function checkHasOwnProperty2(){
                return (!mergedDictionary.hasOwnProperty('MagneticFieldStrength') && !mergedDictionary.hasOwnProperty('EchoTime') && !mergedDictionary.hasOwnProperty('FlipAngle') && !mergedDictionary.hasOwnProperty('ReceiveCoilName'));
              }
              if (path.includes("_bold.nii")) {
                  if(checkHasOwnProperty() && !mergedDictionary.hasOwnProperty('TaskName') && !mergedDictionary.hasOwnProperty('ExperimentID')) {
                        issues.push(new Issue({
                            file: file,
                            code: 68,
                            reason: "The file cannot be converted to NDA , you need to add more properties. See the specification " + sidecarMessage
                        }));
                  }
              }else{
                  if(checkHasOwnProperty()) {
                        issues.push(new Issue({
                            file: file,
                            code: 68,
                            reason: "The file cannot be converted to NDA , you need to add more properties. See the specification " + sidecarMessage
                        }));
                  }
              }
          }
        // task scan checks
        if (path.includes('_task-') && !path.includes('_defacemask.nii') && !path.includes('_sbref.nii')) {
            if (!mergedDictionary.hasOwnProperty('TaskName')) {
                issues.push(new Issue({
                    file: file,
                    code: 50,
                    reason: "You have to define 'TaskName' for this file. " + sidecarMessage
                }));
            }
        }

        // field map checks
        if (path.includes("_bold.nii") || path.includes("_sbref.nii") || path.includes("_dwi.nii")) {
            if (!mergedDictionary.hasOwnProperty('EchoTime')) {
                issues.push(new Issue({
                    file: file,
                    code: 6,
                    reason: "You should define 'EchoTime' for this file. If you don't provide this information field map correction will not be possible. " + sidecarMessage
                }));
            }
            if (!mergedDictionary.hasOwnProperty('PhaseEncodingDirection')) {
                issues.push(new Issue({
                    file: file,
                    code: 7,
                    reason: "You should define 'PhaseEncodingDirection' for this file. If you don't provide this information field map correction will not be possible. " + sidecarMessage
                }));
            }
            if (!mergedDictionary.hasOwnProperty('EffectiveEchoSpacing')) {
                issues.push(new Issue({
                    file: file,
                    code: 8,
                    reason: "You should define 'EffectiveEchoSpacing' for this file. If you don't provide this information field map correction will not be possible. " + sidecarMessage
                }));
            }
        }
        if (path.includes("_dwi.nii")) {
            if (!mergedDictionary.hasOwnProperty('TotalReadoutTime')) {
                issues.push(new Issue({
                    file: file,
                    code: 9,
                    reason: "You should define 'TotalReadoutTime' for this file. If you don't provide this information field map correction using TOPUP might not be possible. " + sidecarMessage
                }));
            }
        }

        // we don't need slice timing or repetition time for SBref
        if (path.includes("_bold.nii")) {
            if (!mergedDictionary.hasOwnProperty('RepetitionTime')) {
                issues.push(new Issue({
                    file: file,
                    code: 10,
                    reason: "You have to define 'RepetitionTime' for this file. " + sidecarMessage
                }));
            }

            if (mergedDictionary.RepetitionTime && header) {
                if (repetitionUnit !== 's') {
                    issues.push(new Issue({
                        file: file,
                        code: 11
                    }));
                } else {
                    var niftiTR = Number((repetitionTime).toFixed(3));
                    var jsonTR = Number((mergedDictionary.RepetitionTime).toFixed(3));
                    if (niftiTR !== jsonTR) {
                        issues.push(new Issue({
                            file: file,
                            code: 12,
                            reason: "Repetition time defined in the JSON (" + jsonTR + " sec.) did not match the one defined in the NIFTI header (" + niftiTR + " sec.)"
                        }));
                    }
                }
            }

            if (!mergedDictionary.hasOwnProperty('SliceTiming')) {
                issues.push(new Issue({
                    file: file,
                    code: 13,
                    reason: "You should define 'SliceTiming' for this file. If you don't provide this information slice time correction will not be possible. " + sidecarMessage
                }));
            }

            if (mergedDictionary.hasOwnProperty('SliceTiming') && mergedDictionary["SliceTiming"].constructor === Array) {
                var SliceTimingArray = mergedDictionary["SliceTiming"];
                var invalid_valuesArray = checkSliceTimingArray(SliceTimingArray, mergedDictionary['RepetitionTime']);
                if (invalid_valuesArray.length > 0){
                    issues.push(new Issue({
                        file: file,
                        code: 66,
                        evidence: invalid_valuesArray
                    }));
                }
            }
        }
        else if (path.includes("_phasediff.nii")){
            if (!mergedDictionary.hasOwnProperty('EchoTime1') || !mergedDictionary.hasOwnProperty('EchoTime2')) {
                issues.push(new Issue({
                    file: file,
                    code: 15,
                    reason: "You have to define 'EchoTime1' and 'EchoTime2' for this file. " + sidecarMessage
                }));
            }
        } else if (path.includes("_phase1.nii") || path.includes("_phase2.nii")){
            if (!mergedDictionary.hasOwnProperty('EchoTime')) {
                issues.push(new Issue({
                    file: file,
                    code:16,
                    reason: "You have to define 'EchoTime' for this file. " + sidecarMessage
                }));
            }
        } else if (path.includes("_fieldmap.nii")){
            if (!mergedDictionary.hasOwnProperty('Units')) {
                issues.push(new Issue({
                    file: file,
                    code: 17,
                    reason: "You have to define 'Units' for this file. " + sidecarMessage
                }));
            }
        } else if (path.includes("_epi.nii")){
            if (!mergedDictionary.hasOwnProperty('PhaseEncodingDirection')) {
                issues.push(new Issue({
                    file: file,
                    code: 18,
                    reason: "You have to define 'PhaseEncodingDirection' for this file. " + sidecarMessage
                }));
            }
            if (!mergedDictionary.hasOwnProperty('TotalReadoutTime')) {
                issues.push(new Issue({
                    file: file,
                    code: 19,
                    reason: "You have to define 'TotalReadoutTime' for this file. " + sidecarMessage
                }));
            }
        }

        if (utils.type.isFieldMapMainNii(path) && mergedDictionary.hasOwnProperty('IntendedFor')) {
            var intendedFor = typeof mergedDictionary['IntendedFor'] == "string" ? [mergedDictionary['IntendedFor']] : mergedDictionary['IntendedFor'];

            for (var key = 0; key < intendedFor.length; key++) {
                var intendedForFile = intendedFor[key];
                checkIfIntendedExists(intendedForFile, fileList, issues, file);
            }
        }
    }

    callback(issues);
};

function missingEvents(path, potentialEvents, events) {
    var hasEvent = false,
        isRest   = false;

    // check if is a rest file
    var pathParts = path.split('/');
    var filenameParts  = pathParts[pathParts.length - 1].split('_');
    for (var i = 0; i < filenameParts.length; i++) {
        var part = filenameParts[i];
        if (part.toLowerCase().indexOf('task') === 0 && part.indexOf('rest') > -1) {
            isRest = true;
        }
    }

    // check for event file
    for (var j = 0; j < potentialEvents.length; j++) {
        var event = potentialEvents[j];
        if (events.indexOf(event) > -1) {
            hasEvent = true;
        }
    }

    return !isRest && path.includes('_bold.nii') && !hasEvent;
}


/**
 * Potential Locations
 *
 * Takes the path to the lowest possible level of
 * a file that can be hierarchily positioned and
 * return a list of all possible locations for that
 * file.
 */
function potentialLocations(path) {
    var potentialPaths = [path];
    var pathComponents = path.split('/');
    var filenameComponents = pathComponents[pathComponents.length - 1].split("_");

    var sessionLevelComponentList = [],
        subjectLevelComponentList = [],
        topLevelComponentList = [],
        ses = null,
        sub = null;

    filenameComponents.forEach(function (filenameComponent) {
        if (filenameComponent.substring(0, 3) != "run") {
            sessionLevelComponentList.push(filenameComponent);
            if (filenameComponent.substring(0, 3) == "ses") {
                ses = filenameComponent;

            } else {
                subjectLevelComponentList.push(filenameComponent);
                if (filenameComponent.substring(0, 3) == "sub") {
                    sub = filenameComponent;
                } else {
                    topLevelComponentList.push(filenameComponent);
                }
            }
        }
    });

    if (ses) {
        addPotentialPaths(sessionLevelComponentList, potentialPaths, 2, "/" + sub + "/" + ses + "/");
    }
    addPotentialPaths(subjectLevelComponentList, potentialPaths, 1, "/" + sub + "/");
    addPotentialPaths(topLevelComponentList, potentialPaths, 0, "/");
    potentialPaths.reverse();

    return potentialPaths;
}

function addPotentialPaths(componentList, potentialPaths, offset, prefix) {
    for (var i = componentList.length; i > offset; i--) {
        var tmpList = componentList.slice(0, i-1).concat([componentList[componentList.length-1]]);
        var sessionLevelPath = prefix + tmpList.join("_");
        potentialPaths.push(sessionLevelPath);
    }
}

/**
 * Generate Merged Sidecar Dictionary
 *
 * Takes an array of potential sidecards and a
 * master object dictionary of all JSON file
 * content and returns a merged dictionary
 * containing all values from the potential
 * sidecars.
 */
function generateMergedSidecarDict(potentialSidecars, jsonContents) {
    var mergedDictionary = {};
    for (var i = 0; i < potentialSidecars.length; i++) {
        var sidecarName = potentialSidecars[i];
        var jsonObject = jsonContents[sidecarName];
        if (jsonObject) {
            for (var key in jsonObject) {
                mergedDictionary[key] = jsonObject[key];
            }
        } else if (jsonObject === null) {
            mergedDictionary.invalid = true;
        }
    }
    return mergedDictionary;
}
/**
 * Function to check each SoliceTime from SliceTiming Array
 *
 */

function checkSliceTimingArray(array, repetitionTime){
    var invalid_timesArray = [];
    for (var t = 0; t < array.length; t++){
        if (array[t] > repetitionTime){
            invalid_timesArray.push(array[t]);
        }
    }
    return invalid_timesArray;
}
/**
 * Get B-File Contents
 *
 * Takes an array of potential bval or bvec files
 * and a master b-file contents dictionary and returns
 * the contents of the desired file.
 */
function getBFileContent(potentialBFiles, bContentsDict) {
    for (var i = 0; i < potentialBFiles.length; i++) {
        var potentialBFile = potentialBFiles[i];
        if (bContentsDict.hasOwnProperty(potentialBFile)) {
            return bContentsDict[potentialBFile];
        }
    }
}
