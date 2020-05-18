"""Validation class for BIDS projects."""
import re
import os
import json


class BIDSValidator():
    """Object for BIDS (Brain Imaging Data Structure) verification.

    The main method of this class is `is_bids()`. You should use it for
    checking whether a file path is compatible with BIDS.

    """

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
        self.dir_rules = os.path.join(os.path.dirname(__file__)) + "/rules/"
        self.index_associated = index_associated

    def is_bids(self, path):
        """Check if file path adheres to BIDS.

        Main method of the validator. uses other class methods for checking
        different aspects of the file path.

        Parameters
        ----------
        path : str
            Path of a file to be checked. Must be relative to root of a BIDS
            dataset.

        Notes
        -----
        When you test a file path, make sure that the path is relative to the
        root of the BIDS dataset the file is part of. That is, as soon as the
        file path contains parts outside of the BIDS dataset, the validation
        will fail. For example "home/username/my_dataset/participants.tsv" will
        fail, although "participants.tsv" is a valid BIDS file.

        Examples
        --------
        >>> from bids_validator import BIDSValidator
        >>> validator = BIDSValidator()
        >>> filepaths = ["/sub-01/anat/sub-01_rec-CSD_T1w.nii.gz",
        ... "/sub-01/anat/sub-01_acq-23_rec-CSD_T1w.exe", # wrong extension
        ... "home/username/my_dataset/participants.tsv", # not relative to root
        ... "/participants.tsv"]
        >>> for filepath in filepaths:
        ...     print(validator.is_bids(filepath))
        True
        False
        False
        True

        """
        conditions = []

        conditions.append(self.is_top_level(path))
        conditions.append(self.is_associated_data(path))
        conditions.append(self.is_session_level(path))
        conditions.append(self.is_subject_level(path))
        conditions.append(self.is_phenotypic(path))
        conditions.append(self.is_file(path))

        return (any(conditions))

    def is_top_level(self, path):
        """Check if the file has appropriate name for a top-level file."""
        with open(self.dir_rules + 'fixed_top_level_names.json', 'r') as fin:
            fixed_top_level_json = json.load(fin)
            fixed_top_level_names = fixed_top_level_json['fixed_top_level_names']  # noqa: E501

        regexps = self.get_regular_expressions(self.dir_rules +
                                               'top_level_rules.json')

        conditions = [False if re.compile(x).search(path) is None else True for
                      x in regexps]

        conditions.append(path in fixed_top_level_names)

        return (any(conditions))

    def is_associated_data(self, path):
        """Check if file is appropriate associated data."""
        if not self.index_associated:
            return False

        regexps = self.get_regular_expressions(self.dir_rules +
                                               'associated_data_rules.json')

        conditions = [(re.compile(x).search(path) is not None) for
                      x in regexps]

        return any(conditions)

    def is_session_level(self, path):
        """Check if the file has appropriate name for a session level."""
        regexps = self.get_regular_expressions(self.dir_rules +
                                               'session_level_rules.json')

        conditions = [self.conditional_match(x, path) for x in regexps]

        return (any(conditions))

    def is_subject_level(self, path):
        """Check if the file has appropriate name for a subject level."""
        regexps = self.get_regular_expressions(self.dir_rules +
                                               'subject_level_rules.json')

        conditions = [(re.compile(x).search(path) is not None) for
                      x in regexps]

        return (any(conditions))

    def is_phenotypic(self, path):
        """Check if file is phenotypic data."""
        regexps = self.get_regular_expressions(self.dir_rules +
                                               'phenotypic_rules.json')

        conditions = [(re.compile(x).search(path) is not None) for
                      x in regexps]

        return (any(conditions))

    def is_file(self, path):
        """Check if file is phenotypic data."""
        regexps = self.get_regular_expressions(self.dir_rules +
                                               'file_level_rules.json')

        conditions = [(re.compile(x).search(path) is not None) for
                      x in regexps]

        return (any(conditions))

    def get_regular_expressions(self, file_name):
        """Read regular expressions from a file."""
        regexps = []

        with open(file_name, 'r') as fin:
            rules = json.load(fin)

        for key in list(rules.keys()):
            rule = rules[key]

            regexp = rule["regexp"]

            if "tokens" in rule:
                tokens = rule["tokens"]

                for token in list(tokens):
                    regexp = regexp.replace(token, "|".join(tokens[token]))

            regexps.append(regexp)

        return regexps

    def conditional_match(self, expression, path):
        """Find conditional match."""
        match = re.compile(expression).findall(path)
        match = match[0] if len(match) >= 1 else False
        # adapted from JS code and JS does not support conditional groups
        if (match):
            if ((match[1] == match[2][1:]) | (not match[1])):
                return True
            else:
                return False
        else:
            return False
