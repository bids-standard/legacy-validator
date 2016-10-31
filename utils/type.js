/**
 * Type
 *
 * A library of functions that take a file path and return a boolean
 * representing whether the given file path is valid within the
 * BIDS specification requirements.
 */
var anatSuffixes = ["T1w", "T2w", "T1map", "T2map", "T1rho", "FLAIR", "PD", "PDT2", "inplaneT1", "inplaneT2","angio",
    "defacemask", "SWImagandphase"];

module.exports = {

    /**
     * Is BIDS
     *
     * Check if a given path is valid within the
     * bids spec.
     */
    isBIDS: function(path) {
        return (
            this.isTopLevel(path)       ||
            this.isAssociatedData(path) ||
            this.isSessionLevel(path)   ||
            this.isSubjectLevel(path)   ||
            this.isAnat(path)           ||
            this.isDWI(path)            ||
            this.isFunc(path)           ||
            this.isBehavioral(path)     ||
            this.isCont(path)           ||
            this.isFieldMap(path)
        );
    },

    /**
     * Check if the file has appropriate name for a top level file
     */
    isTopLevel: function(path) {
        var fixedTopLevelNames = ["/README", "/CHANGES", "/dataset_description.json", "/participants.tsv",
            "participants.json", "/phasediff.json", "/phase1.json", "/phase2.json" ,"/fieldmap.json"];

        var funcTopRe = new RegExp('^\\/(?:ses-[a-zA-Z0-9]+_)?task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?'
            + '(_bold.json|_events.json|_events.tsv|_physio.json|_stim.json)$');

        var anatTopRe = new RegExp('^\\/(?:ses-[a-zA-Z0-9]+_)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+_)?'
            + '(' + anatSuffixes.join("|") + ').json$');

        var dwiTopRe = new RegExp('^\\/(?:ses-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_)?'
            + 'dwi.(?:json|bval|bvec)$');

        var multiDirFieldmapRe = new RegExp('^\\/(?:dir-[a-zA-Z0-9]+)_epi.json$');


        return (fixedTopLevelNames.indexOf(path) != -1 || funcTopRe.test(path) || dwiTopRe.test(path) ||
        anatTopRe.test(path) || multiDirFieldmapRe.test(path));
    },

    isAssociatedData: function(path) {
        var associatedData = new RegExp('^\\/(?:code|derivatives|sourcedata|[.]git)\\/(?:.*)$');
        return associatedData.test(path);
    },

    /**
     * Check if the file has appropriate name for a session level
     */
    isSessionLevel: function(path) {
        var scansRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?\\1(_\\2)?(_scans.tsv|_scans.json)$');

        var funcSesRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?\\1(_\\2)?task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?'
            + '(_bold.json|_events.json|_events.tsv|_physio.json|_stim.json)$');

        var anatSesRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+_)?'
            + '(' + anatSuffixes.join("|") + ').json$');

        var dwiSesRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_)?'
            + 'dwi.(?:json|bval|bvec)$');

        return conditionalMatch(scansRe, path) || conditionalMatch(funcSesRe, path) ||
            conditionalMatch(anatSesRe, path) || conditionalMatch(dwiSesRe, path);
    },

    /**
     * Check if the file has appropriate name for a subject level
     */
    isSubjectLevel: function(path) {
        var scansRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/\\1(_sessions.tsv|_sessions.json)$');
        return scansRe.test(path);
    },

    /**
     * Check if the file has a name appropriate for an anatomical scan
     */
    isAnat: function(path) {
        var anatRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?anat' +
            '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?_(?:'
            + anatSuffixes.join("|")
            + ').(nii.gz|nii|json)$');
        return conditionalMatch(anatRe, path);
    },

    /**
     * Check if the file has a name appropriate for a diffusion scan
     */
    isDWI: function(path) {
        var suffixes = ["dwi", "sbref"];
        var anatRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?dwi' +
            '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?_(?:'
            + suffixes.join("|")
            + ').(nii.gz|nii|json|bvec|bval)$');
        return conditionalMatch(anatRe, path);
    },

    /**
     * Check if the file has a name appropriate for a fieldmap scan
     */
    isFieldMap: function(path) {
        var suffixes = ["phasediff", "phase1", "phase2", "magnitude1", "magnitude2", "fieldmap", "epi"];
        var anatRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?fmap' +
            '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_dir-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?_(?:'
            + suffixes.join("|")
            + ').(nii.gz|nii|json)$');
        return conditionalMatch(anatRe, path);
    },

    /**
     * Check if the file has a name appropriate for a functional scan
     */
    isFunc: function(path) {
        var funcRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?func' +
            '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?'
            + '(?:_bold.nii.gz|_bold.nii|_bold.json|_sbref.nii.gz|_sbref.json|_events.json|_events.tsv|_physio.tsv.gz|_stim.tsv.gz|_physio.json|_stim.json|_defacemask.nii.gz|_defacemask.nii)$');
        return conditionalMatch(funcRe, path);
    },

    isBehavioral: function(path) {
        var funcBeh = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?beh' +
            '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?'
            + '(?:_beh.json|_events.json|_events.tsv|_physio.tsv.gz|_stim.tsv.gz|_physio.json|_stim.json)$');
        return conditionalMatch(funcBeh, path);
    },

    isFuncBold: function(path) {
        var funcRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?func' +
            '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?'
            + '(?:_bold.nii.gz|_bold.nii|_sbref.nii.gz|_sbref.nii)$');
        return conditionalMatch(funcRe, path);
    },

    isCont: function(path) {
        var contRe = new RegExp('^\\/(sub-[a-zA-Z0-9]+)' +
            '\\/(?:(ses-[a-zA-Z0-9]+)' +
            '\\/)?(?:func|beh)' +
            '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?' +
            '(?:_recording-[a-zA-Z0-9]+)?'
            + '(?:_physio.tsv.gz|_stim.tsv.gz|_physio.json|_stim.json)$');
        return conditionalMatch(contRe, path);
    },

    isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

};

function conditionalMatch (expression, path) {
    var match = expression.exec(path);

        // we need to do this because JS does not support conditional groups
        if (match){
            if ((match[2] && match[3]) || !match[2]) {
                return true;
            }
        }
        return false;
}
