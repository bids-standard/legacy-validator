/**
 * Issues
 *
 * A list of all possible issues organized by
 * issue code and including severity and reason
 * agnostic to file specifics.
 */
module.exports = {
  0: {
    key: 'INTERNAL ERROR',
    severity: 'error',
    reason: 'Internal error. SOME VALIDATION STEPS MAY NOT HAVE OCCURRED',
  },
  1: {
    key: 'NOT_INCLUDED',
    severity: 'error',
    reason:
      'Files with such naming scheme are not part of BIDS specification. This error is most commonly ' +
      'caused by typos in file names that make them not BIDS compatible. Please consult the specification and ' +
      'make sure your files are named correctly. If this is not a file naming issue (for example when including ' +
      'files not yet covered by the BIDS specification) you should include a ".bidsignore" file in your dataset (see' +
      ' https://github.com/bids-standard/bids-validator#bidsignore for details). Please ' +
      'note that derived (processed) data should be placed in /derivatives folder and source data (such as DICOMS ' +
      'or behavioural logs in proprietary formats) should be placed in the /sourcedata folder.',
  },
  2: {
    key: 'REPETITION_TIME_GREATER_THAN',
    severity: 'warning',
    reason:
      "'RepetitionTime' is greater than 100 are you sure it's expressed in seconds?",
  },
  3: {
    key: 'ECHO_TIME_GREATER_THAN',
    severity: 'warning',
    reason:
      "'EchoTime' is greater than 1 are you sure it's expressed in seconds?",
  },
  4: {
    key: 'ECHO_TIME_DIFFERENCE_GREATER_THAN',
    severity: 'warning',
    reason:
      "'EchoTimeDifference' is greater than 1 are you sure it's expressed in seconds?",
  },
  5: {
    key: 'TOTAL_READOUT_TIME_GREATER_THAN',
    severity: 'warning',
    reason:
      "'TotalReadoutTime' is greater than 10 are you sure it's expressed in seconds?",
  },
  6: {
    key: 'ECHO_TIME_NOT_DEFINED',
    severity: 'warning',
    reason:
      "You should define 'EchoTime' for this file. If you don't provide this information field map correction will not be possible.",
  },
  7: {
    key: 'PHASE_ENCODING_DIRECTION_NOT_DEFINED',
    severity: 'warning',
    reason:
      "You should define 'PhaseEncodingDirection' for this file. If you don't provide this information field map correction will not be possible.",
  },
  8: {
    key: 'EFFECTIVE_ECHO_SPACING_NOT_DEFINED',
    severity: 'warning',
    reason:
      "You should define 'EffectiveEchoSpacing' for this file. If you don't provide this information field map correction will not be possible.",
  },
  9: {
    key: 'TOTAL_READOUT_TIME_NOT_DEFINED',
    severity: 'warning',
    reason:
      "You should define 'TotalReadoutTime' for this file. If you don't provide this information field map correction using TOPUP might not be possible.",
  },
  10: {
    key: 'REPETITION_TIME_MUST_DEFINE',
    severity: 'error',
    reason: "You have to define 'RepetitionTime' for this file.",
  },
  11: {
    key: 'REPETITION_TIME_UNITS',
    severity: 'error',
    reason:
      "Repetition time was not defined in seconds, milliseconds or microseconds in the scan's header.",
  },
  12: {
    key: 'REPETITION_TIME_MISMATCH',
    severity: 'error',
    reason:
      "Repetition time did not match between the scan's header and the associated JSON metadata file.",
  },
  13: {
    key: 'SLICE_TIMING_NOT_DEFINED',
    severity: 'warning',
    reason:
      "You should define 'SliceTiming' for this file. If you don't provide this information slice time correction will not be possible.",
  },
  15: {
    key: 'ECHO_TIME1-2_NOT_DEFINED',
    severity: 'error',
    reason: "You have to define 'EchoTime1' and 'EchoTime2' for this file.",
  },
  16: {
    key: 'ECHO_TIME_MUST_DEFINE',
    severity: 'error',
    reason: "You have to define 'EchoTime' for this file.",
  },
  17: {
    key: 'UNITS_MUST_DEFINE',
    severity: 'error',
    reason: "You have to define 'Units' for this file.",
  },
  18: {
    key: 'PHASE_ENCODING_DIRECTION_MUST_DEFINE',
    severity: 'error',
    reason: "You have to define 'PhaseEncodingDirection' for this file.",
  },
  19: {
    key: 'TOTAL_READOUT_TIME_MUST_DEFINE',
    severity: 'error',
    reason: "You have to define 'TotalReadoutTime' for this file.",
  },
  20: {
    key: 'EVENTS_COLUMN_ONSET',
    severity: 'error',
    reason: "First column of the events file must be named 'onset'",
  },
  21: {
    key: 'EVENTS_COLUMN_DURATION',
    severity: 'error',
    reason: "Second column of the events file must be named 'duration'",
  },
  22: {
    key: 'TSV_EQUAL_ROWS',
    severity: 'error',
    reason:
      'All rows must have the same number of columns as there are headers.',
  },
  23: {
    key: 'TSV_EMPTY_CELL',
    severity: 'error',
    reason:
      'Empty cell in TSV file detected: The proper way of labeling missing values is "n/a".',
  },
  24: {
    key: 'TSV_IMPROPER_NA',
    severity: 'warning',
    reason: 'A proper way of labeling missing values is "n/a".',
  },
  25: {
    key: 'EVENTS_TSV_MISSING',
    severity: 'warning',
    reason:
      'Task scans should have a corresponding events.tsv file. If this is a resting state scan you can ignore this warning or rename the task to include the word "rest".',
  },
  26: {
    key: 'NIFTI_HEADER_UNREADABLE',
    severity: 'error',
    reason:
      'We were unable to parse header data from this NIfTI file. Please ensure it is not corrupted or mislabeled.',
  },
  27: {
    key: 'JSON_INVALID',
    severity: 'error',
    reason: 'Not a valid JSON file.',
  },
  28: {
    key: 'GZ_NOT_GZIPPED',
    severity: 'error',
    reason: 'This file ends in the .gz extension but is not actually gzipped.',
  },
  29: {
    key: 'VOLUME_COUNT_MISMATCH',
    severity: 'error',
    reason:
      'The number of volumes in this scan does not match the number of volumes in the corresponding .bvec and .bval files.',
  },
  30: {
    key: 'BVAL_MULTIPLE_ROWS',
    severity: 'error',
    reason: '.bval files should contain exactly one row of volumes.',
  },
  31: {
    key: 'BVEC_NUMBER_ROWS',
    severity: 'error',
    reason: '.bvec files should contain exactly three rows of volumes.',
  },
  32: {
    key: 'DWI_MISSING_BVEC',
    severity: 'error',
    reason: 'DWI scans should have a corresponding .bvec file.',
  },
  33: {
    key: 'DWI_MISSING_BVAL',
    severity: 'error',
    reason: 'DWI scans should have a corresponding .bval file.',
  },
  36: {
    key: 'NIFTI_TOO_SMALL',
    severity: 'error',
    reason: 'This file is too small to contain the minimal NIfTI header.',
  },
  37: {
    key: 'INTENDED_FOR',
    severity: 'error',
    reason: "'IntendedFor' field needs to point to an existing file.",
  },
  38: {
    key: 'INCONSISTENT_SUBJECTS',
    severity: 'warning',
    reason:
      'Not all subjects contain the same files. Each subject should contain the same number of files with ' +
      'the same naming unless some files are known to be missing.',
  },
  39: {
    key: 'INCONSISTENT_PARAMETERS',
    severity: 'warning',
    reason: 'Not all subjects/sessions/runs have the same scanning parameters.',
  },
  40: {
    key: 'NIFTI_DIMENSION',
    severity: 'warning',
    reason:
      "Nifti file's header field for dimension information blank or too short.",
  },
  41: {
    key: 'NIFTI_UNIT',
    severity: 'warning',
    reason:
      "Nifti file's header field for unit information for x, y, z, and t dimensions empty or too short",
  },
  42: {
    key: 'NIFTI_PIXDIM',
    severity: 'warning',
    reason:
      "Nifti file's header field for pixel dimension information empty or too short.",
  },
  43: {
    key: 'ORPHANED_SYMLINK',
    severity: 'error',
    reason:
      'This file appears to be an orphaned symlink. Make sure it correctly points to its referent.',
  },
  44: {
    key: 'FILE_READ',
    severity: 'error',
    reason:
      'We were unable to read this file. Make sure it is not corrupted, incorrectly named or incorrectly symlinked.',
  },
  45: {
    key: 'SUBJECT_FOLDERS',
    severity: 'error',
    reason:
      'There are no subject folders (labeled "sub-*") in the root of this dataset.',
  },
  46: {
    key: 'BVEC_ROW_LENGTH',
    severity: 'error',
    reason:
      'Each row in a .bvec file should contain the same number of values.',
  },
  47: {
    key: 'B_FILE',
    severity: 'error',
    reason:
      '.bval and .bvec files must be single space delimited and contain only numerical values.',
  },
  48: {
    key: 'PARTICIPANT_ID_COLUMN',
    severity: 'error',
    reason:
      "Participants and phenotype .tsv files must have a 'participant_id' column.",
  },
  49: {
    key: 'PARTICIPANT_ID_MISMATCH',
    severity: 'error',
    reason:
      'Participant labels found in this dataset did not match the values in participant_id column found in the participants.tsv file.',
  },
  50: {
    key: 'TASK_NAME_MUST_DEFINE',
    severity: 'error',
    reason: "You have to define 'TaskName' for this file.",
  },
  51: {
    key: 'PHENOTYPE_SUBJECTS_MISSING',
    severity: 'error',
    reason:
      'A phenotype/ .tsv file lists subjects that were not found in the dataset.',
  },
  52: {
    key: 'STIMULUS_FILE_MISSING',
    severity: 'error',
    reason: 'A stimulus file was declared but not found in the dataset.',
  },
  53: {
    key: 'NO_T1W',
    severity: 'ignore',
    reason: 'Dataset does not contain any T1w scans.',
  },
  54: {
    key: 'BOLD_NOT_4D',
    severity: 'error',
    reason: 'Bold scans must be 4 dimensional.',
  },
  55: {
    key: 'JSON_SCHEMA_VALIDATION_ERROR',
    severity: 'error',
    reason:
      'Invalid JSON file. The file is not formatted according the schema.',
  },
  56: {
    key: 'Participants age 89 or higher',
    severity: 'warning',
    reason:
      'As per section 164.514(C) of "The De-identification Standard" under HIPAA guidelines, participants with age 89 or higher should be tagged as 89+. More information can be found at https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/#standard',
  },
  57: {
    key: 'DATASET_DESCRIPTION_JSON_MISSING',
    severity: 'error',
    reason:
      'The compulsory file /dataset_description.json is missing. See Section 8.1 of the BIDS specification.',
  },
  58: {
    key: 'TASK_NAME_CONTAIN_ILLEGAL_CHARACTER',
    severity: 'error',
    reason:
      'Task Name contain an Illegal Character hyphen or underscore. Please edit the filename as per BIDS spec.',
  },
  59: {
    key: 'ACQ_NAME_CONTAIN_ILLEGAL_CHARACTER',
    severity: 'error',
    reason:
      'acq Name contain an Illegal Character hyphen or underscore. Please edit the filename as per BIDS spec.',
  },
  60: {
    key: 'SFORM_AND_QFORM_IN_IMAGE_HEADER_ARE_ZERO',
    severity: 'error',
    reason:
      'sform_code and qform_code in the image header are 0. The image/file will be considered invalid or assumed to be in LAS orientation.',
  },
  61: {
    key: 'QUICK_VALIDATION_FAILED',
    severity: 'error',
    reason:
      'Quick validation failed - the general folder structure does not resemble a BIDS dataset. Have you chosen the right folder (with "sub-*/" subfolders)? Check for structural/naming issues and presence of at least one subject.',
  },
  62: {
    key: 'SUBJECT_VALUE_CONTAINS_ILLEGAL_CHARECTER',
    severity: 'error',
    reason:
      'Sub label contain an Illegal Character hyphen or underscore. Please edit the filename as per BIDS spec.',
  },
  63: {
    key: 'SESSION_VALUE_CONTAINS_ILLEGAL_CHARECTER',
    severity: 'error',
    reason:
      'Ses label contain an Illegal Character hyphen or underscore. Please edit the filename as per BIDS spec.',
  },
  64: {
    key: 'SUBJECT_LABEL_IN_FILENAME_DOESNOT_MATCH_DIRECTORY',
    severity: 'error',
    reason:
      "Subject label in the filename doesn't match with the path of the file. File seems to be saved in incorrect subject directory.",
  },
  65: {
    key: 'SESSION_LABEL_IN_FILENAME_DOESNOT_MATCH_DIRECTORY',
    severity: 'error',
    reason:
      "Session label in the filename doesn't match with the path of the file. File seems to be saved in incorrect session directory.",
  },
  66: {
    key: 'SLICETIMING_VALUES_GREATOR_THAN_REPETITION_TIME',
    severity: 'error',
    reason:
      '"SliceTiming" value/s contains invalid value as it is greater than RepetitionTime.  SliceTiming values should be in seconds not milliseconds (common mistake).',
  },
  67: {
    key: 'NO_VALID_DATA_FOUND_FOR_SUBJECT',
    severity: 'error',
    reason: 'No BIDS compatible data found for at least one subject.',
  },
  68: {
    key: 'FILENAME_COLUMN',
    severity: 'error',
    reason: "_scans.tsv files must have a 'filename' column.",
  },
  70: {
    key: 'WRONG_NEW_LINE',
    severity: 'error',
    reason:
      "All TSV files must use Line Feed '\\n' characters to denote new lines. This files uses Carriage Return '\\r'.",
  },
  71: {
    key: 'MISSING_TSV_COLUMN_CHANNELS',
    severity: 'error',
    reason:
      "The column names of the channels file must begin with ['name', 'type', 'units']",
  },
  72: {
    key: 'MISSING_TSV_COLUMN_IEEG_CHANNELS',
    severity: 'error',
    reason:
      "The column names of the channels file must begin with ['name', 'type', 'units', 'sampling_frequency', 'low_cutoff', 'high_cutoff', 'notch', 'reference']",
  },
  73: {
    key: 'MISSING_TSV_COLUMN_IEEG_ELECTRODES',
    severity: 'error',
    reason:
      "The column names of the electrodes file must begin with ['name', 'x', 'y', 'z', 'size', 'type']",
  },
  74: {
    key: 'DUPLICATE_NIFTI_FILES',
    severity: 'error',
    reason: "Nifti file exist with both '.nii' and '.nii.gz' extensions.",
  },
  75: {
    key: 'NIFTI_PIXDIM4',
    severity: 'error',
    reason: "Nifti file's header is missing time dimension information.",
  },
  76: {
    key: 'EFFECTIVEECHOSPACING_TOO_LARGE',
    severity: 'error',
    reason: "Abnormally high value of 'EffectiveEchoSpacing'.",
  },
  77: {
    key: 'UNUSED_STIMULUS',
    severity: 'warning',
    reason:
      'There are files in the /stimuli directory that are not utilized in any _events.tsv file.',
  },
  78: {
    key: 'CHANNELS_COLUMN_SFREQ',
    severity: 'error',
    reason:
      "Fourth column of the channels file must be named 'sampling_frequency'",
  },
  79: {
    key: 'CHANNELS_COLUMN_LOWCUT',
    severity: 'error',
    reason: "Third column of the channels file must be named 'low_cutoff'",
  },
  80: {
    key: 'CHANNELS_COLUMN_HIGHCUT',
    severity: 'error',
    reason: "Third column of the channels file must be named 'high_cutoff'",
  },
  81: {
    key: 'CHANNELS_COLUMN_NOTCH',
    severity: 'error',
    reason: "Third column of the channels file must be named 'notch'",
  },
  82: {
    key: 'CUSTOM_COLUMN_WITHOUT_DESCRIPTION',
    severity: 'warning',
    reason:
      'Tabular file contains custom columns not described in a data dictionary',
  },
  83: {
    key: 'ECHOTIME1_2_DIFFERENCE_UNREASONABLE',
    severity: 'error',
    reason:
      'The value of (EchoTime2 - EchoTime1) should be within the range of 0.0001 - 0.01.',
  },
  84: {
    key: 'ACQTIME_FMT',
    severity: 'error',
    reason:
      'Entries in the "acq_time" column of _scans.tsv should be expressed in the following format YYYY-MM-DDTHH:mm:ss (year, month, day, hour (24h), minute, second; this is equivalent to the RFC3339 “date-time” format. ',
  },
  85: {
    key: 'SUSPICIOUSLY_LONG_EVENT_DESIGN',
    severity: 'warning',
    reason:
      'The onset of the last event is after the total duration of the corresponding scan. This design is suspiciously long. ',
  },
  86: {
    key: 'SUSPICIOUSLY_SHORT_EVENT_DESIGN',
    severity: 'warning',
    reason:
      'The onset of the last event is less than half the total duration of the corresponding scan. This design is suspiciously short. ',
  },
  87: {
    key: 'SLICETIMING_ELEMENTS',
    severity: 'warning',
    reason:
      "The number of elements in the SliceTiming array should match the 'k' dimension of the corresponding nifti volume.",
  },
  88: {
    key: 'MALFORMED_BVEC',
    severity: 'error',
    reason:
      'The contents of this .bvec file are undefined or severely malformed. ',
  },
  89: {
    key: 'MALFORMED_BVAL',
    severity: 'error',
    reason:
      'The contents of this .bval file are undefined or severely malformed. ',
  },
  90: {
    key: 'SIDECAR_WITHOUT_DATAFILE',
    severity: 'error',
    reason: 'A json sidecar file was found without a corresponding data file',
  },
  91: {
    key: '_FIELDMAP_WITHOUT_MAGNITUDE_FILE',
    severity: 'error',
    reason:
      '_fieldmap.nii[.gz] file does not have accompanying _magnitude.nii[.gz] file. ',
  },
  92: {
    key: 'MISSING_MAGNITUDE1_FILE',
    severity: 'warning',
    reason:
      'Each _phasediff.nii[.gz] file should be associated with a _magnitude1.nii[.gz] file.',
  },
  93: {
    key: 'EFFECTIVEECHOSPACING_LARGER_THAN_TOTALREADOUTTIME',
    severity: 'error',
    reason:
      'EffectiveEchoSpacing should always be smaller than TotalReadoutTime. ',
  },
  94: {
    key: 'MAGNITUDE_FILE_WITH_TOO_MANY_DIMENSIONS',
    severity: 'error',
    reason:
      '_magnitude1.nii[.gz] and _magnitude2.nii[.gz] files must have exactly three dimensions. ',
  },
  95: {
    key: 'T1W_FILE_WITH_TOO_MANY_DIMENSIONS',
    severity: 'error',
    reason: '_T1w.nii[.gz] files must have exactly three dimensions. ',
  },
  96: {
    key: 'MISSING_TSV_COLUMN_EEG_ELECTRODES',
    severity: 'error',
    reason:
      "The column names of the electrodes file must begin with ['name', 'x', 'y', 'z']",
  },
  97: {
    key: 'MISSING_SESSION',
    severity: 'warning',
    reason: 'Not all subjects contain the same sessions.',
  },
  98: {
    key: 'INACCESSIBLE_REMOTE_FILE',
    severity: 'error',
    reason:
      'This file appears to be a symlink to a remote annexed file but could not be accessed from any of the configured remotes.',
  },
  99: {
    key: 'EMPTY_FILE',
    severity: 'error',
    reason: 'Empty files not allowed.',
  },
}
