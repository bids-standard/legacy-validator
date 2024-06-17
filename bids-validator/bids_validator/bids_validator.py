"""Validation class for BIDS projects."""
import logging
import os
import re
from functools import lru_cache
from itertools import chain

import bidsschematools as bst
import bidsschematools.rules
import bidsschematools.schema
import bidsschematools.utils
import bidsschematools.validator


class LoggingContext:
    # From logging cookbook (CC0):
    # https://docs.python.org/3/howto/logging-cookbook.html#using-a-context-manager-for-selective-logging
    #
    # Changes:
    #   - Added docstrings (2024.05.06)
    """Context manager to temporarily modify logging configuration.

    Parameters
    ----------
    logger : logging.Logger
        Logger object to be modified.
    level : int
        Logging level to set temporarily. If None, the level is not
        modified.
    handler : logging.Handler
        Handler to add temporarily. If None, no handler is added.
    close : bool
        Whether to close the handler after removing it. Defaults to True.
    """

    def __init__(self, logger, level=None, handler=None, close=True):
        self.logger = logger
        self.level = level
        self.handler = handler
        self.close = close

    def __enter__(self):
        if self.level is not None:
            self.old_level = self.logger.level
            self.logger.setLevel(self.level)
        if self.handler:
            self.logger.addHandler(self.handler)

    def __exit__(self, et, ev, tb):
        if self.level is not None:
            self.logger.setLevel(self.old_level)
        if self.handler:
            self.logger.removeHandler(self.handler)
        if self.handler and self.close:
            self.handler.close()


class BIDSValidator:
    """Object for BIDS (Brain Imaging Data Structure) verification.

    The main method of this class is `is_bids()`. You should use it for
    checking whether a file path is compatible with BIDS.
    """

    regexes = None

    def __init__(self, index_associated=True):
        """Initialize BIDSValidator object.

        Parameters
        ----------
        index_associated : bool
            Specifies if an associated data should be checked. If it is true
            then any file paths in directories `code/`, `derivatives/`,
            `sourcedata/` and `stimuli/` will pass the validation, else they
            won't. Defaults to True.

        """
        self.index_associated = index_associated

    @classmethod
    def _init_regexes(cls):
        if cls.regexes is None:
            with LoggingContext(bst.utils.get_logger(), level=logging.WARNING):
                schema = bst.schema.load_schema()

            all_rules = chain.from_iterable(
                bst.rules.regexify_filename_rules(group, schema, level=2)
                for group in (schema.rules.files.common, schema.rules.files.raw)
            )
            cls.regexes = [rule['regex'] for rule in all_rules]

    @classmethod
    def parse(cls, path):
        """Parse a file path into a dictionary of BIDS entities.

        Parameters
        ----------
        path : str
            Path of a file to be parsed. Must be relative to root of a BIDS
            dataset, and must include a leading forward slash `/`.

        Returns
        -------
        dict
            Dictionary of BIDS entities. Keys are entity names, values are
            entity values. If the file path is not compatible with BIDS, an
            empty dictionary is returned.

        Notes
        -----
        When you test a file path, make sure that the path is relative to the
        root of the BIDS dataset the file is part of. That is, as soon as the
        file path contains parts outside of the BIDS dataset, the validation
        will fail. For example "home/username/my_dataset/participants.tsv" will
        fail, although "/participants.tsv" is a valid BIDS file.

        Examples
        --------
        >>> from bids_validator import BIDSValidator
        >>> validator = BIDSValidator()
        >>> validator.parse("/sub-01/anat/sub-01_rec-CSD_T1w.nii.gz")
        {'subject': '01', 'datatype': 'anat', 'reconstruction': 'CSD', 'suffix': 'T1w',
         'extension': '.nii.gz'}
        >>> validator.parse("/sub-01/anat/sub-01_acq-23_rec-CSD_T1w.exe")
        {}
        >>> validator.parse("home/username/my_dataset/participants.tsv")
        Traceback (most recent call last):
            ...
        ValueError: Path must be relative to root of a BIDS dataset, ...
        >>> validator.parse("/participants.tsv")
        {'stem': 'participants', 'extension': '.tsv'}

        """
        if cls.regexes is None:
            cls._init_regexes()

        if path.startswith(os.sep):
            path = path.replace(os.sep, '/')

        if not path.startswith('/'):
            raise ValueError("Path must be relative to root of a BIDS dataset,"
                             " and must include a leading forward slash `/`.")

        for regex in cls.regexes:
            match = re.match(regex, path[1:])
            if match:
                return {k: v for k, v in match.groupdict().items() if v is not None}

        return {}

    @classmethod
    @lru_cache
    def is_bids(cls, path):
        """Check if file path adheres to BIDS.

        Main method of the validator. Uses other class methods for checking
        different aspects of the file path.

        Parameters
        ----------
        path : str
            Path of a file to be checked. Must be relative to root of a BIDS
            dataset, and must include a leading forward slash `/`.

        Notes
        -----
        When you test a file path, make sure that the path is relative to the
        root of the BIDS dataset the file is part of. That is, as soon as the
        file path contains parts outside of the BIDS dataset, the validation
        will fail. For example "home/username/my_dataset/participants.tsv" will
        fail, although "/participants.tsv" is a valid BIDS file.

        Examples
        --------
        >>> from bids_validator import BIDSValidator
        >>> validator = BIDSValidator()
        >>> filepaths = [
        ...   "/sub-01/anat/sub-01_rec-CSD_T1w.nii.gz",
        ...   "/sub-01/anat/sub-01_acq-23_rec-CSD_T1w.exe", # wrong extension
        ...   "home/username/my_dataset/participants.tsv", # not relative to root
        ...   "/participants.tsv",
        ... ]
        >>> for filepath in filepaths:
        ...     print(validator.is_bids(filepath))
        True
        False
        False
        True

        """
        try:
            return cls.parse(path) != {}
        except ValueError:
            return False

    @classmethod
    def is_top_level(cls, path):
        """Check if the file has appropriate name for a top-level file."""
        parts = cls.parse(path)
        if not parts:
            return False
        return parts.get('subject') is None

    def is_associated_data(self, path):
        """Check if file is appropriate associated data."""
        if not self.index_associated:
            return False

        parts = self.parse(path)
        if not parts:
            return False
        return parts.get('path') in ('code', 'derivatives', 'stimuli', 'sourcedata')

    @classmethod
    def is_session_level(cls, path):
        """Check if the file has appropriate name for a session level."""
        parts = cls.parse(path)
        if not parts:
            return False
        return parts.get('datatype') is None and parts.get('suffix') != 'sessions'

    @classmethod
    def is_subject_level(cls, path):
        """Check if the file has appropriate name for a subject level."""
        parts = cls.parse(path)
        if not parts:
            return False
        return parts.get('suffix') == 'sessions'

    @classmethod
    def is_phenotypic(cls, path):
        """Check if file is phenotypic data."""
        parts = cls.parse(path)
        if not parts:
            return False
        return parts.get('datatype') == 'phenotype'

    @classmethod
    def is_file(cls, path):
        """Check if file is a data file or non-inherited metadata file."""
        parts = cls.parse(path)
        if not parts:
            return False
        return parts.get('datatype') not in (None, 'phenotype')
