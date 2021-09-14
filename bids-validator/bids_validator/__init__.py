"""BIDS validator common Python package."""
from .bids_validator import BIDSValidator
__all__ = ['BIDSValidator']

from . import _version
__version__ = _version.get_versions()['version']
