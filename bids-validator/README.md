[![CircleCI](https://circleci.com/gh/bids-standard/bids-validator.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/bids-standard/bids-validator)
[![Gitlab pipeline status](https://img.shields.io/gitlab/pipeline/bids-standard/bids-validator?logo=GitLab)](https://gitlab.com/bids-standard/bids-validator/pipelines)
[![Codecov](https://codecov.io/gh/bids-standard/bids-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/bids-standard/bids-validator)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3688707.svg)](https://doi.org/10.5281/zenodo.3688707)

# BIDS-Validator

- [BIDS-Validator](#bids-validator)
  - [Quickstart](#quickstart)
  - [Support](#support)
  - [Maintainers and Contributors](#maintainers-and-contributors)
  - [Use](#use)
    - [API](#api)
    - [.bidsignore](#bidsignore)
    - [Configuration](#configuration)
    - [In the Browser](#in-the-browser)
    - [On the Server](#on-the-server)
    - [Through Command Line](#through-command-line)
  - [Docker image](#docker-image)
  - [Python Library](#python-library)
    - [Example](#example)
  - [Development](#development)
    - [Running Locally in a Browser](#running-locally-in-a-browser)
    - [Testing](#testing)
    - [Publishing](#publishing)
  - [Acknowledgments](#acknowledgments)

## Quickstart

1. Web version:
   1. Open [Google Chrome](https://www.google.com/chrome/) or
      [Mozilla Firefox](https://mozilla.org/firefox) (currently the only
      supported browsers)
   1. Go to http://bids-standard.github.io/bids-validator/ and select a folder
      with your BIDS dataset. If the validator seems to be working longer than
      couple of minutes please open [developer tools ](https://developer.chrome.com/devtools)
      and report the error at [https://github.com/bids-standard/bids-validator/issues](https://github.com/bids-standard/bids-validator/issues).
1. Command line version:
   1. Install [Node.js](https://nodejs.org) (at least version 10.11.0)
   1. From a terminal run `npm install -g bids-validator`
   1. Run `bids-validator` to start validating datasets.
1. Docker
   1. Install Docker
   1. From a terminal run `docker run -ti --rm -v /path/to/data:/data:ro bids/validator /data`
      but replace the `/path/to/data` part of the command with your own path on your machine.
1. Python Library:
   1. Install [Python](https://www.python.org/) (works with python2 and python3)
   1. Install [Pip](https://pip.pypa.io/en/stable/installing/) package manager for python, if
      not already installed.
   1. From a terminal run `pip install bids_validator` to acquire the
      [BIDS Validator PyPi package](https://pypi.org/project/bids-validator/)
   1. Open a Python terminal `python`
   1. Import the BIDS Validator package `from bids_validator import BIDSValidator`
   1. Check if a file is BIDS compatible `BIDSValidator().is_bids('path/to/a/bids/file')`

## Support

The BIDS Validator is designed to work in both the browser and in Node.js. We
target support for the latest long term stable (LTS) release of Node.js and the
latest version of Chrome.

There is also a library of helper functions written in Python, for use with BIDS
compliant applications written in this language.

Please report any issues you experience while using these support targets via
the [GitHub issue tracker](https://github.com/bids-standard/bids-validator/issues).
If you experience issues outside of these supported environments and believe we
should extend our targeted support feel free to open a new issue describing the
issue, your support target and why you require extended support and we will
address these issues on a case by case basis.

## Maintainers and Contributors

This package is maintained by [@rwblair](https://github.com/rwblair/).

Some of our awesome contributors include:

[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/0)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/0)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/1)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/1)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/2)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/2)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/3)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/3)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/4)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/4)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/5)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/5)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/6)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/6)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/7)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/7)

Please also see [Acknowledgments](#acknowledgments).

## Use

### API

The BIDS Validator has one primary method that takes a directory as either a
path to the directory (node) or the object given by selecting a directory with a
file input (browser), an options object, and a callback.

Available options include:

- ignoreWarnings - (boolean - defaults to false)
- ignoreNiftiHeaders - (boolean - defaults to false)

For example:

`validate.BIDS(directory, {ignoreWarnings: true}, function (issues, summary) {console.log(issues.errors, issues.warnings);});`

If you would like to test individual files you can use the file specific checks
that we expose.

- validate.BIDS()
- validate.JSON()
- validate.TSV()
- validate.NIFTI()

Additionally you can reformat stored errors against a new config using `validate.reformat()`

### .bidsignore

Optionally one can include a `.bidsignore` file in the root of the dataset. This
file lists patterns (compatible with the [.gitignore syntax](https://git-scm.com/docs/gitignore))
defining files that should be ignored by the validator. This option is useful
when the validated dataset includes file types not yet supported by BIDS
specification.

```Text
*_not_bids.txt
extra_data/
```

### Configuration

You can configure the severity of errors by passing a json configuration file
with a `-c` or `--config` flag to the command line interface or by defining a
config object on the options object passed during javascript usage.

If no path is specified a default path of `.bids-validator-config.json` will be used. You can add this file to your dataset to share dataset specific validation configuration. To disable this behavior use `--no-config` and the default configuration will be used.

The basic configuration format is outlined below. All configuration is optional.

```JSON
{
	"ignore": [],
	"warn": [],
	"error": [],
	"ignoredFiles": []
}
```

`ignoredFiles` takes a list of file paths or glob patterns you'd like to ignore.
Lets say we want to ignore all files and sub-directory under `/derivatives/`.
**This is not the same syntax as used in the .bidsignore file**

```JSON
{
	"ignoredFiles": ["/derivatives/**"]
}
```

Note that adding two stars `**` in path makes validator recognize all files and
sub-dir to be ignored.

`ignore`, `warn`, and `error` take lists of issue codes or issue keys and change
the severity of those issues so they are either ignored or reported as warnings
or errors. You can find a list of all available issues at
[utils/issues/list](https://github.com/bids-standard/bids-validator/tree/master/utils/issues/list.js).

Some issues may be ignored by default, but can be elevated to warnings or errors.
These provide a way to check for common things that are more specific than BIDS
compatibility. An example is a check for the presence of a T1w modality. The
following would raise an error if no T1W image was found in a dataset.

```JSON
{
	"error": ["NO_T1W"]
}
```

In addition to issue codes and keys these lists can also contain objects with
and "and" or "or" properties set to arrays of codes or keys. These allow some
level of conditional logic when configuring issues. For example:

```JSON
{
	"ignore": [
		{
			"and": [
				"ECHO_TIME_GREATER_THAN",
				"ECHO_TIME_NOT_DEFINED"
			]
		}
	]
}
```

In the above example the two issues will only be ignored if both of them are
triggered during validation.

```JSON
{
	"ignore": [
		{
			"and": [
				"ECHO_TIME_GREATER_THAN",
				"ECHO_TIME_NOT_DEFINED"
				{
					"or": [
						"ECHO_TIME1-2_NOT_DEFINED",
						"ECHO_TIME_MUST_DEFINE"
					]
				}
			]
		}
	]
}
```

And in this example the listed issues will only be ignored if
`ECHO_TIME_GREATER_THAN`, `ECHO_TIME_NOT_DEFINED` and either
`ECHO_TIME1-2_NOT_DEFINED` or `ECHO_TIME_MUST_DEFINE` are triggered during
validation.

"or" arrays are not supported at the lowest level because it wouldn't add any
functionality. For example the following is not supported.

```JSON
{
	"ignore": [
		{
			"or": [
				"ECHO_TIME_GREATER_THAN",
				"ECHO_TIME_NOT_DEFINED"
			]
		}
	]
}
```

because it would be functionally the same as this:

```JSON
{
	"ignore": [
		"ECHO_TIME_GREATER_THAN",
		"ECHO_TIME_NOT_DEFINED"
	]
}
```

For passing a configuration while using the bids-validator on the command line,
note that you **have to specify at least two configurations of a given type**,
because an array is expected. For example, the following code will ignore empty
file errors (99) and files that cannot be read (44):

```
bids-validator --config.ignore=99 --config.ignore=44 path/to/bids/dir
```

This style of use puts limits on what configuration you can require, so for
complex scenarios, we advise users to create a dedicated configuration file with
contents as described above.

### In the Browser

The BIDS Validator currently works in the browser with [browserify](http://browserify.org/)
or [webpack](https://webpack.js.org/). You can add it to a project by cloning
the validator and requiring it with browserify syntax
`var validate = require('bids-validator');` or an ES2015 webpack import
`import validate from 'bids-validator'`.

### On the Server

The BIDS validator works like most npm packages. You can install it by running
`npm install bids-validator`.

### Through Command Line

If you install the bids validator globally by using `npm install -g bids-validator`
you will be able to use it as a command line tool. Once installed you should be
able to run `bids-validator /path/to/your/bids/directory` and see any validation
issues logged to the terminal. Run `bids-validator` without a directory path to
see available options.

## Docker image

[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/bids/validator?label=docker)](https://hub.docker.com/r/bids/validator)

To use bids validator with [docker](https://www.docker.com/), you simply need to
[install docker](https://docs.docker.com/install/) on your system.

And then from a terminal run:

- `docker run -ti --rm bids/validator --version` to print the version of the
  docker image
- `docker run -ti --rm bids/validator --help` to print the help
- `docker run -ti --rm -v /path/to/data:/data:ro bids/validator /data`
  to validate the dataset `/path/to/data` on your host machine

See here for a brief explanation of the commands:

- `docker run` is the command to tell docker to run a certain docker image,
  usually taking the form `docker run <IMAGENAME> <COMMAND>`
- the `-ti` flag means the inputs are accepted and outputs are printed to the
  terminal
- the `--rm` flag means that the state of the docker container is not saved
  after it has run
- the `-v` flag is adding your local data to the docker container
  ([bind-mounts](https://docs.docker.com/storage/bind-mounts/)). Importantly,
  the input after the `-v` flag consists of three fields separated colons: `:`
  - the first field is the path to the directory on the host machine:
    `/path/to/data`
  - the second field is the path where the directory is mounted in the
    container
  - the third field is optional. In our case, we use `ro` to specify that the
    mounted data is _read only_

## Python Library

[![PyPI version](https://badge.fury.io/py/bids-validator.svg)](https://badge.fury.io/py/bids-validator)

There are is a limited library of helper functions written in Python. The main function
determines if a file extension is compliant with the BIDS specification. You can find
the available functions in the library, as well as their descriptions,
[here](https://github.com/bids-standard/bids-validator/blob/master/bids-validator/bids_validator/bids_validator.py).
To install, run `pip install -U bids_validator` (requires python and pip).

### Example

```Python
from bids_validator import BIDSValidator
validator = BIDSValidator()
filepaths = ["/sub-01/anat/sub-01_rec-CSD_T1w.nii.gz", "/sub-01/anat/sub-01_acq-23_rec-CSD_T1w.exe"]
for filepath in filepaths:
    print(validator.is_bids(filepath))  # will print True, and then False
```

## Development

To develop locally, clone the project and run `yarn` from the project
root. This will install external dependencies. If you wish to install
`bids-validator` globally (so that you can run it in other folders), use the
following command to install it globally: `cd bids-validator && npm install -g`

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md)
for additional details.

### Running Locally in a Browser

A note about OS X, the dependencies for the browser require a npm package called
node-gyp which needs xcode to be installed in order to be compiled.

1. The browser version of `bids-validator` lives in the repo subdirectory
   `/bids-validator-web`. It is a [React.js](https://reactjs.org/) application
   that uses the [next.js](https://nextjs.org/) framework.
2. To develop `bids-validator` and see how it will act in the browser, simply run
   `yarn web-dev` in the project root and navigate to `localhost:3000`.
3. In development mode, changes to the codebase will trigger rebuilds of the application
   automatically.
4. Changes to the `/bids-validator` in the codebase will also be reflected in the
   web application.
5. Tests use the [Jest](https://jestjs.io/index.html) testing library and should be developed in `/bids-validator-web/tests`.
   We can always use more tests, so please feel free to contribute a test that reduces the chance
   of any bugs you fix!
6. To ensure that the web application compiles successfully in production, run `yarn web-export`

### Testing

If it's your first time running tests, first use the command `git submodule update --init --depth 1` to pull the test example data. This repo contains the [bids-examples github repository](https://github.com/bids-standard/bids-examples) as a [submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules).

To start the test suite run `npm test` from the project root. `npm test -- --watch`
is useful to run tests while making changes. A coverage report is available with
`npm run coverage`.

To run the linter which checks code conventions run `npm run lint`.

### Publishing

Publishing is done with [Lerna](https://github.com/lerna/lerna). Use the command `yarn lerna publish` and follow instructions to set a new version.

Using lerna publish will create a git commit with updated version information and create a version number tag for it, push the tag to GitHub, then publish to NPM and PyPI. The GitHub release is manual following that.

## Acknowledgments

Many contributions to the `bids-validator` were done by members of the
BIDS community. See the
[list of contributors](https://bids-specification.readthedocs.io/en/stable/99-appendices/01-contributors.html).

A large part of the development of `bids-validator` is currently done by
[Squishymedia](https://squishymedia.com/), who are in turn financed through
different grants offered for the general development of BIDS. See the list
below.

Development and contributions were supported through the following federally
funded projects/grants:

- [BIDS Derivatives (NIMH: R24MH114705, PI: Poldrack)](http://grantome.com/grant/NIH/R24-MH114705-01)
- [OpenNeuro (NIMH: R24MH117179, PI: Poldrack)](http://grantome.com/grant/NIH/R24-MH117179-01)
- [Spokes: MEDIUM: WEST (NSF: 1760950, PI: Poldrack & Gorgolewski)](http://grantome.com/grant/NSF/IIS-1760950)
- [ReproNim](http://repronim.org) [(NIH-NIBIB P41 EB019936, PI: Kennedy)](https://projectreporter.nih.gov/project_info_description.cfm?aid=8999833) 
