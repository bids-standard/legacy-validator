"""Test BIDSValidator functionality.

git-annex and datalad are used to download a test data structure without the
actual file contents.

"""

import os

import pytest
import datalad.api

from bids_validator import BIDSValidator

HOME = os.path.expanduser('~')

TEST_DATA_DICT = {
    'eeg_matchingpennies': (
        'https://gin.g-node.org/sappelhoff/eeg_matchingpennies'
    ),
    }

EXCLUDE_KEYWORDS = ['git', 'datalad', 'sourcedata', 'bidsignore']


def _download_test_data(test_data_dict, dsname):
    """Download test data using datalad."""
    url = test_data_dict[dsname]
    dspath = os.path.join(HOME, dsname)
    datalad.api.clone(source=url, path=dspath)
    return dspath


def _gather_test_files(dspath, exclude_keywords):
    """Get test files from dataset path, relative to dataset."""
    files = []
    for r, _, f in os.walk(dspath):
        for file in f:
            fname = os.path.join(r, file)
            fname = fname.replace(dspath, '')
            if not any(keyword in fname for keyword in exclude_keywords):
                files.append(fname)

    return files


dspath = _download_test_data(TEST_DATA_DICT, 'eeg_matchingpennies')
files = _gather_test_files(dspath, EXCLUDE_KEYWORDS)


@pytest.fixture(scope='module')
def validator():
    """Return a BIDSValidator instance."""
    validator = BIDSValidator()
    return validator


@pytest.mark.parametrize('fname', files)
def test_datasets(validator, fname):
    """Test that is_bids returns true for each file in a valid BIDS dataset."""
    assert validator.is_bids(fname)


@pytest.mark.parametrize('fname, matches', [
    ('/T1w.json', True),
    ('/dataset_description.json', True),
    ('/README', True),
    ('/CHANGES', True),
    ('/participants.tsv', True),
    ('/sub-01/anat/sub-01_T1w.nii.gz', False),
])
def test_top_level(validator, fname, matches):
    """Test that is_top_level returns true for top-level files."""
    assert validator.is_top_level(fname) is matches


@pytest.mark.parametrize('fname, matches', [
    ('/sourcedata/unstructured_data.nii.gz', True),
    ('/sourcedata/dicom_dir/xyz.dcm', True),
    ('/code/my_analysis/analysis.py', True),
    ('/derivatives/preproc/sub-01/anat/sub-01_desc-preproc_T1w.nii.gz', True),
    ('/stimuli/pic.jpg', True),
    ('/sub-01/anat/sub-01_T1w.nii.gz', False),
])
def test_associated_data(validator, fname, matches):
    """Test that is_associated_data returns true for associated data."""
    assert validator.is_associated_data(fname) is matches


@pytest.mark.parametrize('fname, matches', [
    ('/sub-01/ses-1/sub-01_ses-1_scans.tsv', True),
    ('/sub-01/ses-1/sub-01_ses-1_scans.json', True),
    ('/sub-01/sub-01_scans.tsv', True),
    ('/sub-01/sub-01_scans.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_task-rest_bold.json', True),
    ('/sub-01/sub-01_task-rest_bold.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_asl.json', True),
    ('/sub-01/sub-01_asl.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_pet.json', True),
    ('/sub-01/sub-01_pet.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_proc-test_channels.tsv', True),
    ('/sub-01/ses-1/sub-01_ses-1_channels.json', True),
    ('/sub-01/sub-01_proc-test_channels.tsv', True),
    ('/sub-01/sub-01_channels.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_space-CapTrak_electrodes.tsv', True),
    ('/sub-01/ses-1/sub-01_ses-1_coordsystem.json', True),
    ('/sub-01/sub-01_space-CapTrak_electrodes.tsv', True),
    ('/sub-01/sub-01_coordsystem.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_motion.json', True),
    ('/sub-01/sub-01_motion.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_TEM.json', True),
    ('/sub-01/sub-01_TEM.json', True),
    ('/sub-01/ses-1/sub-01_ses-1_nirs.json', True),
    ('/sub-01/sub-01_nirs.json', True),
    # Mismatch sessions
    ('/sub-01/sub-01_ses-1_scans.tsv', False),
    ('/sub-01/sub-01_ses-1_scans.json', False),
    ('/sub-01/ses-1/sub-01_ses-2_scans.tsv', False),
    # File-level
    ('/sub-01/ses-1/func/sub-01_ses-1_task-rest_bold.nii.gz', False),
    ('/sub-01/anat/sub-01_T1w.nii.gz', False),
])
def test_session_level(validator, fname, matches):
    """Test that is_session_level returns true for session level files."""
    assert validator.is_session_level(fname) is matches


@pytest.mark.parametrize('fname, matches', [
    ('/sub-01/sub-01_sessions.tsv', True),
    ('/sub-01/sub-01_sessions.json', True),
    ('/sub-01/anat/sub-01_T1w.nii.gz', False),
])
def test_subject_level(validator, fname, matches):
    """Test that is_subject_level returns true for subject level files."""
    assert validator.is_subject_level(fname) is matches


@pytest.mark.parametrize('fname, matches', [
    ('/phenotype/measure.tsv', True),
    ('/phenotype/measure.json', True),
    ('/sub-01/anat/sub-01_T1w.nii.gz', False),
])
def test_phenotpic(validator, fname, matches):
    """Test that is_phenotypic returns true for phenotypic files."""
    assert validator.is_phenotypic(fname) is matches


@pytest.mark.parametrize('fname, matches', [
    ('/sub-01/ses-1/func/sub-01_ses-1_task-rest_bold.nii.gz', True),
    ('/sub-01/anat/sub-01_T1w.nii.gz', True),
])
def test_file_level(validator, fname, matches):
    """Test that is_file returns true for file level files."""
    assert validator.is_file(fname) is matches
