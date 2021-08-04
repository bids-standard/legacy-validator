/**
 * Issues
 *
 * A list of all possible issues organized by
 * issue code and including severity and reason
 * agnostic to file specifics.
 */
export default {
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
      "You should define 'SliceTiming' for this file. If you don't provide this information slice time correction will not be possible. 'Slice Timing' is the time at which each slice was acquired within each volume (frame) of the acquisition. Slice timing is not slice order -- rather, it is a list of times containing the time (in seconds) of each slice acquisition in relation to the beginning of volume acquisition.",
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
      "NIfTI file's header field for dimension information blank or too short.",
  },
  41: {
    key: 'NIFTI_UNIT',
    severity: 'warning',
    reason:
      "NIfTI file's header field for unit information for x, y, z, and t dimensions empty or too short",
  },
  42: {
    key: 'NIFTI_PIXDIM',
    severity: 'warning',
    reason:
      "NIfTI file's header field for pixel dimension information empty or too short.",
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
      'We were unable to read this file. Make sure it contains data (file size > 0 kB) and is not corrupted, incorrectly named, or incorrectly symlinked.',
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
      'The compulsory file /dataset_description.json is missing. See Section 03 (Modality agnostic files) of the BIDS specification.',
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
    key: 'SUBJECT_VALUE_CONTAINS_ILLEGAL_CHARACTER',
    severity: 'error',
    reason:
      'Sub label contain an Illegal Character hyphen or underscore. Please edit the filename as per BIDS spec.',
  },
  63: {
    key: 'SESSION_VALUE_CONTAINS_ILLEGAL_CHARACTER',
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
      "The column names of the channels file must begin with ['name', 'type', 'units', 'low_cutoff', 'high_cutoff']",
  },
  73: {
    key: 'MISSING_TSV_COLUMN_IEEG_ELECTRODES',
    severity: 'error',
    reason:
      "The column names of the electrodes file must begin with ['name', 'x', 'y', 'z', 'size']",
  },
  74: {
    key: 'DUPLICATE_NIFTI_FILES',
    severity: 'error',
    reason: "NIfTI file exist with both '.nii' and '.nii.gz' extensions.",
  },
  75: {
    key: 'NIFTI_PIXDIM4',
    severity: 'error',
    reason: "NIfTI file's header is missing time dimension information.",
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
      'Entries in the "acq_time" column of _scans.tsv should be expressed in the following format YYYY-MM-DDTHH:mm:ss[.000000] (year, month, day, hour (24h), minute, second, and optionally fractional second; this is equivalent to the RFC3339 "date-time" format.',
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
      "The number of elements in the SliceTiming array should match the 'k' dimension of the corresponding NIfTI volume.",
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
  100: {
    key: 'BRAINVISION_LINKS_BROKEN',
    severity: 'error',
    reason:
      'Internal file pointers in BrainVision file triplet (*.eeg, *.vhdr, and *.vmrk) are broken or some files do not exist.',
  },
  101: {
    key: 'README_FILE_MISSING',
    severity: 'warning',
    reason:
      'The recommended file /README is missing. See Section 03 (Modality agnostic files) of the BIDS specification.',
  },
  102: {
    key: 'TOO_FEW_AUTHORS',
    severity: 'warning',
    reason:
      'The Authors field of dataset_description.json should contain an array of fields - with one author per field. This was triggered based on the presence of only one author field. Please ignore if all contributors are already properly listed.',
  },
  103: {
    key: 'MULTIPLE_COMMAS_IN_AUTHOR_FIELD',
    severity: 'error',
    reason:
      'The Authors field of dataset_description.json should contain an array of fields - with one author per field. This was triggered based on the presence of multiple commas in a single author field. Please ensure your authors are properly formatted.',
  },
  104: {
    key: 'HED_ERROR',
    severity: 'error',
    reason: 'The validation on this HED string returned an error.',
  },
  105: {
    key: 'HED_WARNING',
    severity: 'warning',
    reason: 'The validation on this HED string returned a warning.',
  },
  106: {
    key: 'HED_INTERNAL_ERROR',
    severity: 'error',
    reason: 'An internal error occurred during HED validation.',
  },
  107: {
    key: 'HED_INTERNAL_WARNING',
    severity: 'warning',
    reason: 'An internal warning occurred during HED validation.',
  },
  108: {
    key: 'HED_MISSING_VALUE_IN_SIDECAR',
    severity: 'warning',
    reason:
      'The json sidecar does not contain this column value as a possible key to a HED string.',
  },
  109: {
    key: 'HED_VERSION_NOT_DEFINED',
    severity: 'warning',
    reason:
      "You should define 'HEDVersion' for this file. If you don't provide this information, the HED validation will use the latest version available.",
  },
  113: {
    key: 'NO_AUTHORS',
    severity: 'warning',
    reason:
      'The Authors field of dataset_description.json should contain an array of fields - with one author per field. This was triggered because there are no authors, which will make DOI registration from dataset metadata impossible.',
  },
  114: {
    key: 'INCOMPLETE_DATASET',
    severity: 'error',
    reason:
      'This dataset contains remote files. If you would like to validate with remote files, use the --remoteFiles option.',
  },
  123: {
    key: 'INVALID JSON ENCODING',
    severity: 'error',
    reason: 'JSON files must be valid utf-8.',
  },
  124: {
    key: 'INVALID_TSV_UNITS',
    severity: 'error',
    reason:
      'Units in .tsv files must be valid SI units as described in the BIDS spec Appendix V (https://bids-specification.readthedocs.io/en/stable/99-appendices/05-units.html).',
  },
  125: {
    key: 'CHANNELS_COLUMN_STATUS',
    severity: 'error',
    reason:
      'Status column in channels.tsv files must contain only one of two values: good or bad. Per the BIDS spec: (https://bids-specification.readthedocs.io/en/stable/04-modality-specific-files/04-intracranial-electroencephalography.html#channels-description-_channelstsv).',
  },
  126: {
    key: 'MISSING_TSV_COLUMN_TIME',
    severity: 'error',
    reason: '*_blood.tsv require a time column.',
  },
  127: {
    key: 'NOT_IN_USE',
    severity: 'error',
    reason: 'Code 127 is currently not used or reserved.',
  },
  128: {
    key: 'NO_GENETIC_DATABASE',
    severity: 'error',
    reason:
      'A genetic_info.json file is present but no Database field present in Genetics object in dataset_description.json.',
  },
  129: {
    key: 'SCANS_FILENAME_NOT_MATCH_DATASET',
    severity: 'error',
    reason:
      'The filename in scans.tsv file does not match what is present in the BIDS dataset.',
  },
  130: {
    key: 'CHANNELS_COLUMN_TYPE_UPPER_CASE',
    severity: 'error',
    reason:
      'Type column in channels.tsv files should consist of upper-case characters.',
  },
  131: {
    key: 'CHANNELS_COLUMN_TYPE',
    severity: 'error',
    reason:
      'Type column in channels.tsv files should only consist of values allowed in the specification for MEG/EEG/iEEG data.',
  },
  133: {
    key: 'LABELING_TYPE_MUST_DEFINE',
    severity: 'error',
    reason:
      "You should define 'ArterialSpinLabelingType' for this file. 'ArterialSpinLabelingType' can be CASL, PCASL, PASL.",
  },
  134: {
    key: 'LABELING_DURATION_MUST_DEFINE',
    severity: 'error',
    reason:
      "You should define 'LabelingDuration' for this file. 'LabelingDuration' is the total duration of the labeling pulse train, in seconds, corresponding to the temporal width of the labeling bolus for `(P)CASL`. In case all control-label volumes (or deltam or CBF) have the same `LabelingDuration`, a scalar must be specified. In case the control-label volumes (or deltam or cbf) have a different `LabelingDuration`, an array of numbers must be specified, for which any `m0scan` in the timeseries has a `LabelingDuration` of zero. In case an array of numbers is provided, its length should be equal to the number of volumes specified in `*_aslcontext.tsv`. Corresponds to DICOM Tag 0018,9258 `ASL Pulse Train Duration`.",
  },
  135: {
    key: 'POST_LABELING_DELAY_MUST_DEFINE',
    severity: 'error',
    reason:
      "You should define 'PostLabelingDelay' for this file. 'PostLabelingDelay' is the time, in seconds, after the end of the labeling (for (P)CASL) or middle of the labeling pulse (for PASL) until the middle of the excitation pulse applied to the imaging slab (for 3D acquisition) or first slice (for 2D acquisition). Can be a number (for a single-PLD time series) or an array of numbers (for multi-PLD and Look-Locker). In the latter case, the array of numbers contains the PLD of each volume (i.e. each 'control' and 'label') in the acquisition order. Any image within the time-series without a PLD (e.g. an 'm0scan') is indicated by a zero. Based on DICOM Tags 0018,9079 Inversion Times and 0018,0082 InversionTime.",
  },
  136: {
    key: 'BACKGROUND_SUPPRESSION_MUST_DEFINE',
    severity: 'error',
    reason:
      "You should define 'BackgroundSuppression' for this file. 'BackGroundSuppression' is a boolean indicating if background suppression is used.",
  },
  137: {
    key: 'VASCULAR_CRUSHING_MUST_DEFINE',
    severity: 'warning',
    reason:
      "It is recommended to define 'VascularCrushing' for this file. 'VascularCrushing' is a boolean value indicating if an ASL crusher method is used.",
  },
  138: {
    key: 'PULSE_SEQUENCE_DETAILS_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'PulseSequenceDetails' for this file. 'PulseSequenceDetails' is the information beyond pulse sequence type that identifies the specific pulse sequence used (for example, 'Standard Siemens Sequence distributed with the VB17 software', 'Siemens WIP ### version #.##', or 'Sequence written by X using a version compiled on MM/DD/YYYY').",
  },
  139: {
    key: '139_EMPTY',
    severity: 'warning',
    reason: '',
  },
  140: {
    key: '140_EMPTY',
    severity: 'warning',
    reason: '',
  },
  141: {
    key: '141_EMPTY',
    severity: 'warning',
    reason: '',
  },
  142: {
    key: 'LABELING_SLAB_THICKNESS_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'LabelingSlabThickness' for this file. 'LabelingSlabThickness' is the thickness of the labeling slab in millimeters. For non-selective FAIR a zero is entered. Corresponds to DICOM Tag 0018,9254 ASL Slab Thickness.",
  },
  143: {
    key: 'ACQUISITION_VOXELSIZE_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'AcquisitionVoxelSize' for this file. 'AcquisitionVoxelSize' is an array of numbers with a length of 3, in millimeters. This parameter denotes the original acquisition voxel size, excluding any inter-slice gaps and before any interpolation or resampling within reconstruction or image processing. Any point spread function effects (e.g. due to T2-blurring) that would decrease the effective resolution are not considered here.",
  },
  144: {
    key: 'BACKGROUND_SUPPRESSION_PULSE_TIME_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'BackgroundSuppressionPulseTime' for this file, when the 'BackgroundSuppression' is set to true. 'BackGroundSuppressionPulseTime' is an array of numbers containing timing, in seconds, of the background suppression pulses with respect to the start of the labeling. In case of multi-PLD with different background suppression pulse times, only the pulse time of the first PLD should be defined.",
  },
  145: {
    key: 'VASCULAR_CRUCHING_VENC_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'VascularCrushingVENC' for this file, when the 'VascularCrushing' is set to true. 'VascularCrushingVENC' is the crusher gradient strength, in centimeters per second. Specify either one number for the total time-series, or provide an array of numbers, for example when using QUASAR, using the value zero to identify volumes for which 'VascularCrushing' was turned off. Corresponds to DICOM Tag 0018,925A ASL Crusher Flow Limit.",
  },
  147: {
    key: 'PASL_BOLUS_CUT_OFF_FLAG',
    severity: 'error',
    reason:
      "You should define the 'BolusCutOffFlag' for this file. 'BolusCutOffFlag' is a boolean indicating if a bolus cut-off technique is used. Corresponds to DICOM Tag 0018,925C ASL Bolus Cut-off Flag.",
  },
  149: {
    key: 'PASL_BOLUS_CUT_OFF_DELAY_TIME',
    severity: 'error',
    reason:
      "It is required to define 'BolusCutOffDelayTime' for this file, when 'BolusCutOffFlag' is set to true. 'BolusCutOffDelayTime' is the duration between the end of the labeling and the start of the bolus cut-off saturation pulse(s), in seconds. This can be a number or array of numbers, of which the values must be non-negative and monotonically increasing, depending on the number of bolus cut-off saturation pulses. For Q2TIPS, only the values for the first and last bolus cut-off saturation pulses are provided. Based on DICOM Tag 0018,925F ASL Bolus Cut-off Delay Time.",
  },
  150: {
    key: 'PASL_BOLUS_CUT_OFF_TECHNIQUE',
    severity: 'error',
    reason:
      "It is required to define 'BolusCutOffTechnique' for this file, when 'BolusCutOffFlag' is set to true. 'BolusCutOffTechnique' is the name of the technique used (e.g. Q2TIPS, QUIPSS, QUIPSSII). Corresponds to DICOM Tag 0018,925E ASL Bolus Cut-off Technique.",
  },
  153: {
    key: 'M0Type_NOT_SET',
    severity: 'error',
    reason:
      "You should define the 'M0Type' for this file. 'M0Type' describes the presence of M0 information, as either: “Separate” when a separate `*_m0scan.nii[.gz]` is present, “Included” when an m0scan volume is contained within the current ‘*_asl.nii[.gz]’, “Estimate” when a single whole-brain M0 value is provided, or “Absent” when no specific M0 information is present.",
  },
  154: {
    key: 'M0Type_SET_INCORRECTLY',
    severity: 'error',
    reason:
      "M0Type was not defined correctly. If 'M0Type' is equal to included, the corresponding '*_aslcontext.tsv' should contain the 'm0scan' volume.",
  },
  155: {
    key: 'MRACQUISITIONTYPE_MUST_DEFINE',
    severity: 'error',
    reason:
      "You should define 'MRAcquisitionType' for this file. 'MRAcquistionType' is the type of sequence readout with possible values: `2D` or `3D`. Corresponds to DICOM Tag 0018,0023 `MR Acquisition Type`.",
  },
  156: {
    key: 'ACQUISITION_VOXELSIZE_WRONG',
    severity: 'warning',
    reason:
      "The 'AcquisitionVoxelSize' field length is not 3. 'AcquisitionVoxelSize' should be defined as an array of numbers with a length of 3, in millimeters. This parameter denotes the original acquisition voxel size, excluding any inter-slice gaps and before any interpolation or resampling within reconstruction or image processing. Any point spread function effects (e.g. due to T2-blurring) that would decrease the effective resolution are not considered here.",
  },
  157: {
    key: 'LABELLING_DURATION_LENGTH_NOT_MATCHING_NIFTI',
    severity: 'error',
    reason:
      "The number of values for 'LabelingDuration' for this file does not match the 4th dimension of the NIfTI header. 'LabelingDuration' is the total duration of the labeling pulse train, in seconds, corresponding to the temporal width of the labeling bolus for `(P)CASL`. In case all control-label volumes (or deltam or CBF) have the same `LabelingDuration`, a scalar must be specified. In case the control-label volumes (or deltam or cbf) have a different `LabelingDuration`, an array of numbers must be specified, for which any `m0scan` in the timeseries has a `LabelingDuration` of zero. In case an array of numbers is provided, its length should be equal to the number of volumes specified in `*_aslcontext.tsv`. Corresponds to DICOM Tag 0018,9258 `ASL Pulse Train Duration`.",
  },
  164: {
    key: 'ASL_MANUFACTURER_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'Manufacturer' for this file. 'Manufacturer' is the manufacturer of the equipment that produced the composite instances. Corresponds to DICOM Tag 0008, 0070 Manufacturer",
  },
  165: {
    key: 'ASLCONTEXT_TSV_NOT_CONSISTENT',
    severity: 'error',
    reason:
      "The number of volumes in the '*_aslcontext.tsv' for this file does not match the number of values in the NIfTI header.",
  },
  166: {
    key: 'LOOK_LOCKER_FLIP_ANGLE_MISSING',
    severity: 'error',
    reason:
      "You should define 'FlipAngle' for this file, in case of a LookLocker acquisition. 'FlipAngle' is the flip angle (FA) for the acquisition, specified in degrees. Corresponds to: DICOM Tag 0018, 1314 `Flip Angle`. The data type number may apply to files from any MRI modality concerned with a single value for this field, or to the files in a file collection where the value of this field is iterated using the flip entity. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL or variable flip angle fMRI sequences.",
  },
  167: {
    key: 'FLIP_ANGLE_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'FlipAngle' for this file. 'FlipAngle' is the flip angle (FA) for the acquisition, specified in degrees. Corresponds to: DICOM Tag 0018, 1314 `Flip Angle`. The data type number may apply to files from any MRI modality concerned with a single value for this field, or to the files in a file collection where the value of this field is iterated using the flip entity. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL or variable flip angle fMRI sequences.",
  },
  168: {
    key: 'FLIP_ANGLE_NOT_MATCHING_NIFTI',
    severity: 'error',
    reason:
      "The number of values for 'FlipAngle' for this file does not match the 4th dimension of the NIfTI header. 'FlipAngle' is the flip angle (FA) for the acquisition, specified in degrees. Corresponds to: DICOM Tag 0018, 1314 `Flip Angle`. The data type number may apply to files from any MRI modality concerned with a single value for this field, or to the files in a file collection where the value of this field is iterated using the flip entity. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL or variable flip angle fMRI sequences.",
  },
  169: {
    key: 'LABELING_DURATION_PASL_INCONSISTENT',
    severity: 'error',
    reason:
      "The 'LabelingDuration' for PASL 'ArterialSpinLabelingType' can be only a numerical value put to zero or unset. 'LabelingDuration' is the total duration of the labeling pulse train, in seconds, corresponding to the temporal width of the labeling bolus for `(P)CASL`. In case all control-label volumes (or deltam or CBF) have the same `LabelingDuration`, a scalar must be specified. In case the control-label volumes (or deltam or cbf) have a different `LabelingDuration`, an array of numbers must be specified, for which any `m0scan` in the timeseries has a `LabelingDuration` of zero. In case an array of numbers is provided, its length should be equal to the number of volumes specified in `*_aslcontext.tsv`. Corresponds to DICOM Tag 0018,9258 `ASL Pulse Train Duration`.",
  },
  170: {
    key: 'CONTINOUS_RECORDING_MISSING_JSON',
    severity: 'error',
    reason:
      'Continous recording data files are required to have an associated JSON metadata file.',
  },
  171: {
    key: 'VOLUME_TIMING_MISSING_ACQUISITION_DURATION',
    severity: 'error',
    reason:
      "The field 'VolumeTiming' requires 'AcquisitionDuration' or 'SliceTiming' to be defined.",
  },
  172: {
    key: 'FLIP_ANGLE_NOT_MATCHING_ASLCONTEXT_TSV',
    severity: 'error',
    reason:
      "The number of values for 'FlipAngle' for this file does not match the number of volumes in the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv'. 'FlipAngle' is the flip angle (FA) for the acquisition, specified in degrees. Corresponds to: DICOM Tag 0018, 1314 `Flip Angle`. The data type number may apply to files from any MRI modality concerned with a single value for this field, or to the files in a file collection where the value of this field is iterated using the flip entity. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL or variable flip angle fMRI sequences.",
  },
  173: {
    key: 'POST_LABELING_DELAY_NOT_MATCHING_NIFTI',
    severity: 'error',
    reason:
      "The number of values for 'PostLabelingDelay' for this file does not match the 4th dimension of the NIfTI header. 'PostLabelingDelay' is the time, in seconds, after the end of the labeling (for (P)CASL) or middle of the labeling pulse (for PASL) until the middle of the excitation pulse applied to the imaging slab (for 3D acquisition) or first slice (for 2D acquisition). Can be a number (for a single-PLD time series) or an array of numbers (for multi-PLD and Look-Locker). In the latter case, the array of numbers contains the PLD of each volume (i.e. each 'control' and 'label') in the acquisition order. Any image within the time-series without a PLD (e.g. an 'm0scan') is indicated by a zero. Based on DICOM Tags 0018,9079 Inversion Times and 0018,0082 InversionTime.",
  },
  174: {
    key: 'POST_LABELING_DELAY_NOT_MATCHING_ASLCONTEXT_TSV',
    severity: 'error',
    reason:
      "'The number of values for PostLabelingDelay' for this file does not match the number of volumes in the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv'.'PostLabelingDelay' is the time, in seconds, after the end of the labeling (for (P)CASL) or middle of the labeling pulse (for PASL) until the middle of the excitation pulse applied to the imaging slab (for 3D acquisition) or first slice (for 2D acquisition). Can be a number (for a single-PLD time series) or an array of numbers (for multi-PLD and Look-Locker). In the latter case, the array of numbers contains the PLD of each volume (i.e. each 'control' and 'label') in the acquisition order. Any image within the time-series without a PLD (e.g. an 'm0scan') is indicated by a zero. Based on DICOM Tags 0018,9079 Inversion Times and 0018,0082 InversionTime.",
  },
  175: {
    key: 'LABELLING_DURATION_NOT_MATCHING_ASLCONTEXT_TSV',
    severity: 'error',
    reason:
      "The number of values for 'LabelingDuration' for this file does not match the number of volumes in the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv'. 'LabelingDuration' is the total duration of the labeling pulse train, in seconds, corresponding to the temporal width of the labeling bolus for `(P)CASL`. In case all control-label volumes (or deltam or CBF) have the same `LabelingDuration`, a scalar must be specified. In case the control-label volumes (or deltam or cbf) have a different `LabelingDuration`, an array of numbers must be specified, for which any `m0scan` in the timeseries has a `LabelingDuration` of zero. In case an array of numbers is provided, its length should be equal to the number of volumes specified in `*_aslcontext.tsv`. Corresponds to DICOM Tag 0018,9258 `ASL Pulse Train Duration`.",
  },
  176: {
    key: 'ASLCONTEXT_TSV_INCONSISTENT',
    severity: 'error',
    reason:
      "In the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv', the 'volume_type' can only be filled with volumes ['cbf' ,'m0scan', 'label', 'control', 'deltam'].",
  },
  177: {
    key: 'REPETITIONTIMEPREPARATION_NOT_MATCHING_ASLCONTEXT_TSV',
    severity: 'error',
    reason:
      "The number of values of 'RepetitionTimePreparation' for this file does not match the number of volumes in the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv'. 'RepetitionTimePreparation' is the interval, in seconds, that it takes a preparation pulse block to re-appear at the beginning of the succeeding (essentially identical) pulse sequence block. The data type number may apply to files from any MRI modality concerned with a single value for this field. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL.",
  },
  178: {
    key: 'VOLUME_TIMING_AND_REPETITION_TIME_MUTUALLY_EXCLUSIVE',
    severity: 'error',
    reason:
      "The fields 'VolumeTiming' and 'RepetitionTime' for this file are mutually exclusive. Choose 'RepetitionTime' when the same repetition time is used for all volumes, or 'VolumeTiming' when variable times are used.",
  },
  179: {
    key: 'BACKGROUND_SUPPRESSION_PULSE_NUMBER_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'BackgroundSuppressionNumberPulses' for this file, in case 'BackgroundSuppression' is set to true. 'BackgroundSuppressionNumberPulses' is the number of background suppression pulses used. Note that this excludes any effect of background suppression pulses applied before the labeling.",
  },
  180: {
    key: 'BACKGROUND_SUPPRESSION_PULSE_NUMBER_NOT_CONSISTENT',
    severity: 'warning',
    reason:
      "The 'BackgroundSuppressionNumberPulses' field is not consistent with the length of 'BackgroundSuppressionPulseTime'. 'BackgroundSuppressionNumberPulses' is the number of background suppression pulses used. Note that this excludes any effect of background suppression pulses applied before the labeling.",
  },
  181: {
    key: 'TOTAL_ACQUIRED_VOLUMES_NOT_CONSISTENT',
    severity: 'warning',
    reason:
      "The number of values for 'TotalAcquiredVolumes' for this file does not match number of volumes in the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv'. 'TotalAcquiredVolumes' is the original number of 3D volumes acquired for each volume defined in the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv'.",
  },
  182: {
    key: 'MAGNETIC_FIELD_STRENGTH_MISSING',
    severity: 'error',
    reason:
      "You should define 'MagneticFieldStrength' for this file. 'MagneticFieldStrength' is the nominal field strength of MR magnet in Tesla. Corresponds to DICOM Tag 0018,0087 'Magnetic Field Strength'.",
  },
  183: {
    key: 'SLICE_TIMING_NOT_DEFINED_2D_ASL',
    severity: 'error',
    reason:
      "'You should define SliceTiming', in case 'SequenceType' is set to a 2D sequence. 'SliceTiming' is the time at which each slice was acquired within each volume (frame) of the acquisition. Slice timing is not slice order -- rather, it is a list of times containing the time (in seconds) of each slice acquisition in relation to the beginning of volume acquisition. The list goes through the slices along the slice axis in the slice encoding dimension (see below). Note that to ensure the proper interpretation of the `SliceTiming` field, it is important to check if the OPTIONAL `SliceEncodingDirection` exists. In particular, if `SliceEncodingDirection` is negative, the entries in `SliceTiming` are defined in reverse order with respect to the slice axis, such that the final entry in the `SliceTiming` list is the time of acquisition of slice 0. Without this parameter slice time correction will not be possible. ",
  },
  184: {
    key: 'POST_LABELING_DELAY_GREATER',
    severity: 'warning',
    reason:
      "'PostLabelingDelay' is greater than 10, are you sure it's expressed in seconds? 'PostLabelingDelay' is the time, in seconds, after the end of the labeling (for (P)CASL) or middle of the labeling pulse (for PASL) until the middle of the excitation pulse applied to the imaging slab (for 3D acquisition) or first slice (for 2D acquisition). Can be a number (for a single-PLD time series) or an array of numbers (for multi-PLD and Look-Locker). In the latter case, the array of numbers contains the PLD of each volume (i.e. each 'control' and 'label') in the acquisition order. Any image within the time-series without a PLD (e.g. an 'm0scan') is indicated by a zero. Based on DICOM Tags 0018,9079 Inversion Times and 0018,0082 InversionTime.",
  },
  186: {
    key: 'BOLUS_CUT_OFF_DELAY_TIME_GREATER',
    severity: 'warning',
    reason:
      "'BolusCutOffDelayTime' is greater than 10, are you sure it's expressed in seconds? 'BolusCutOffDelayTime' is duration between the end of the labeling and the start of the bolus cut-off saturation pulse(s), in seconds. This can be a number or array of numbers, of which the values must be non-negative and monotonically increasing, depending on the number of bolus cut-off saturation pulses. For Q2TIPS, only the values for the first and last bolus cut-off saturation pulses are provided. Based on DICOM Tag 0018,925F ASL Bolus Cut-off Delay Time.",
  },
  187: {
    key: 'LABELING_DURATION_GREATER',
    severity: 'warning',
    reason:
      "'LabelingDuration' is greater than 10, are you sure it's expressed in seconds? 'LabelingDuration' is the total duration of the labeling pulse train, in seconds, corresponding to the temporal width of the labeling bolus for `(P)CASL`. In case all control-label volumes (or deltam or CBF) have the same `LabelingDuration`, a scalar must be specified. In case the control-label volumes (or deltam or cbf) have a different `LabelingDuration`, an array of numbers must be specified, for which any `m0scan` in the timeseries has a `LabelingDuration` of zero. In case an array of numbers is provided, its length should be equal to the number of volumes specified in `*_aslcontext.tsv`. Corresponds to DICOM Tag 0018,9258 `ASL Pulse Train Duration`.",
  },
  188: {
    key: 'VOLUME_TIMING_NOT_MONOTONICALLY_INCREASING',
    severity: 'error',
    reason:
      "'VolumeTiming' is not monotonically increasing. 'VolumeTiming' is the time at which each volume was acquired during the acquisition, referring to the start of each readout in the ASL timeseries. Use this field instead of the 'RepetitionTime' field in the case that the ASL timeseries have a non-uniform time distance between acquired volumes. The list must have the same length as the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv', and the numbers must be non-negative and monotonically increasing. If 'VolumeTiming' is defined, this requires acquisition time (TA) to be defined via 'AcquisitionDuration'.",
  },
  189: {
    key: 'CASL_PCASL_NOT_ALLOWED_FIELDS',
    severity: 'error',
    reason:
      "You defined one of the not allowed fields in case of CASL or PCASL 'ArterialSpinLabelingType'. Please verify which field among 'PASLType', 'LabelingSlabThickness' 'BolusCutOffFlag', 'BolusCutOffTimingSequence', 'BolusCutOffDelayTime' and 'BolusCutOffTechnique' you have filled.",
  },
  190: {
    key: 'PASL_NOT_ALLOWED_FIELDS',
    severity: 'error',
    reason:
      "You defined one of the not allowed fields in case of PASL 'ArterialSpinLabelingType'. Please verify which field among 'CASLType', 'PCASLType' 'LabelingPulseAverageGradient', 'LabelingPulseMaximumGradient', 'LabelingPulseAverageB1', 'LabelingPulseDuration', 'LabelingPulseFlipAngle', 'LabelingPulseInterval', 'LabelingDuration' you have filled.",
  },
  191: {
    key: 'PCASL_CASL_LABELING_TYPE_NOT_ALLOWED',
    severity: 'error',
    reason:
      "You defined either the 'CASLType' with a PCASL 'LabellingType' or the 'PCASLType' with a CASL 'LabellingType'. This is not allowed, please check that these fields are filled correctly.",
  },
  192: {
    key: 'BOLUS_CUT_OFF_DELAY_TIME_NOT_MONOTONICALLY_INCREASING',
    severity: 'error',
    reason:
      "'BolusCutOffDelayTime' is not monotonically increasing. 'BolusCutOffDelayTime' is the duration between the end of the labeling and the start of the bolus cut-off saturation pulse(s), in seconds. This can be a number or array of numbers, of which the values must be non-negative and monotonically increasing, depending on the number of bolus cut-off saturation pulses. For Q2TIPS, only the values for the first and last bolus cut-off saturation pulses are provided. Based on DICOM Tag 0018,925F ASL Bolus Cut-off Delay Time.",
  },
  193: {
    key: 'ECHO_TIME_NOT_DEFINED',
    severity: 'error',
    reason:
      "You must define 'EchoTime' for this file. 'EchoTime' is the echo time (TE) for the acquisition, specified in seconds. Corresponds to DICOM Tag 0018, 0081 Echo Time (please note that the DICOM term is in milliseconds not seconds). The data type number may apply to files from any MRI modality concerned with a single value for this field, or to the files in a file collection where the value of this field is iterated using the echo entity. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL or variable echo time fMRI sequences.",
  },
  194: {
    key: 'MRACQUISITIONTYPE_MISSING',
    severity: 'warning',
    reason:
      "It is recommended to define 'MRAcquisitionType' for this file. 'MRAcquistionType' is the type of sequence readout with possible values: `2D` or `3D`. Corresponds to DICOM Tag 0018,0023 `MR Acquisition Type`.",
  },
  195: {
    key: 'M0ESTIMATE_NOT_DEFINED',
    severity: 'error',
    reason:
      "You must define 'M0Estimate' for this file, in case 'M0Type' is defined as 'Estimate'. 'M0Estimate' is a single numerical whole-brain M0 value (referring to the M0 of blood), only if obtained externally (for example retrieved from CSF in a separate measurement).",
  },
  196: {
    key: 'ECHO_TIME_NOT_CONSISTENT',
    severity: 'warning',
    reason:
      "The number of values for 'EchoTime' for this file does not match number of volumes in the 'sub-<label>[_ses-<label>][_acq-<label>][_rec-<label>][_run-<index>]_aslcontext.tsv'.  'EchoTime' is the echo time (TE) for the acquisition, specified in seconds. ",
  },
  197: {
    key: 'ECHO_TIME_ELEMENTS',
    severity: 'warning',
    reason:
      "The number of elements in the 'EchoTime' array should match the 'k' dimension of the corresponding NIfTI volume.",
  },
  198: {
    key: 'M0Type_SET_INCORRECTLY_TO_ABSENT',
    severity: 'error',
    reason:
      "You defined M0Type as 'absent' while including a separate '*_m0scan.nii[.gz]' and '*_m0scan.json', or defining the 'M0Estimate' field. This is not allowed, please check that this field are filled correctly.",
  },
  199: {
    key: 'M0Type_SET_INCORRECTLY_TO_ABSENT_IN_ASLCONTEXT',
    severity: 'error',
    reason:
      "You defined M0Type as 'absent' while including an m0scan volume within the '*_aslcontext.tsv'. This is not allowed, please check that this field are filled correctly.",
  },
  200: {
    key: 'REPETITION_TIME_PREPARATION_MISSING',
    severity: 'error',
    reason:
      "You must define 'RepetitionTimePreparation' for this file. 'RepetitionTimePreparation' is the interval, in seconds, that it takes a preparation pulse block to re-appear at the beginning of the succeeding (essentially identical) pulse sequence block. The data type number may apply to files from any MRI modality concerned with a single value for this field. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL.",
  },
  201: {
    key: 'REPETITIONTIME_PREPARATION_NOT_CONSISTENT',
    severity: 'error',
    reason:
      "The number of values for 'RepetitionTimePreparation' for this file does not match the 4th dimension of the NIfTI header. 'RepetitionTimePreparation' is the interval, in seconds, that it takes a preparation pulse block to re-appear at the beginning of the succeeding (essentially identical) pulse sequence block. The data type number may apply to files from any MRI modality concerned with a single value for this field. The data type array provides a value for each volume in a 4D dataset and should only be used when the volume timing is critical for interpretation of the data, such as in ASL.",
  },
  202: {
    key: 'M0Type_SET_INCORRECTLY',
    severity: 'error',
    reason:
      "M0Type was not defined correctly. If 'M0Type' is equal to separate, the dataset should include a *_m0scan.nii[.gz] and *_m0scan.json file.",
  },
  211: {
    key: 'TSV_MISSING_REQUIRED_COLUMN',
    severity: 'error',
    reason:
      'A TSV file is missing a column required by a value in its JSON sidecar.',
  },
  212: {
    key: 'PARTICIPANT_ID_PATTERN',
    severity: 'error',
    reason:
      'Participant_id column labels must consist of the pattern "sub-<subject_id>".',
  },
  213: {
    key: 'README_FILE_SMALL',
    severity: 'warning',
    reason:
      'The recommended file /README is very small. Please consider expanding it with additional information about the dataset.',
  },
  214: {
    key: 'SAMPLES_JSON_MISSING',
    severity: 'error',
    reason:
      'The compulsory file /samples.json is missing. See Section 03 (Modality agnostic files) of the BIDS specification.',
  },
  215: {
    key: 'SAMPLES_TSV_MISSING',
    severity: 'error',
    reason:
      'The compulsory file /samples.tsv is missing. See Section 03 (Modality agnostic files) of the BIDS specification.',
  },
  216: {
    key: 'PIXEL_SIZE_UNITS',
    severity: 'error',
    reason:
      "PixelSizeUnits was not defined in microseconds (um) in the image's metadata.",
  },
217: {
    key: 'JSON_FIELD_MISSING',
    severity: 'warning',
    reason:
      'One or more recommended fields are missing in the JSON file. See Section Microscopy of the BIDS specification.',
  }
}
