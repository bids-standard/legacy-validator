"""BIDS validator common Python package."""
import argparse
from ._version import get_versions
from .bids_validator import BIDSValidator
__version__ = get_versions()['version']
__all__ = ['BIDSValidator', 'main']
del get_versions


def main():
    "bids-validator cli"
    parser = argparse.ArgumentParser(description="Report whether folders follow https://bids-standard.github.io.")
    parser.add_argument("path", nargs="+", help="Paths to validate")
    args = parser.parse_args()

    for path in args.path:
        if BIDSValidator().is_bids(path):
            raise SystemExit(0)
        else:
            print(f"Validation of {path} failed.", file=sys.stderr)
            raise SystemExit(1)
