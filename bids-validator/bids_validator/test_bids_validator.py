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
    'eeg_matchingpennies': 'https://github.com/sappelhoff/eeg_matchingpennies'
    }

EXCLUDE_KEYWORDS = ['git', 'datalad', 'sourcedata', 'bidsignore']


def _download_test_data(test_data_dict, dsname):
    """Download test data using datalad."""
    url = test_data_dict[dsname]
    dspath = os.path.join(HOME, dsname)
    datalad.api.install(dspath, url)
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


@pytest.mark.parametrize('fname', files)
def test_is_bids(fname):
    """Test that is_bids returns true for each file in a valid BIDS dataset."""
    validator = BIDSValidator()
    assert validator.is_bids(fname)
