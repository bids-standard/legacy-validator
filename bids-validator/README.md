![](https://circleci.com/gh/bids-standard/bids-validator.svg?style=shield&circle-token=:circle-token)
![](https://codecov.io/gh/bids-standard/bids-validator/branch/master/graph/badge.svg)

# BIDS-Validator

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
   1. Install [Node.js](https://nodejs.org) (at least version 8.0)
   1. From a terminal run `npm install -g bids-validator`
   1. Run `bids-validator` to start validating datasets.
1. Docker
   1. Install Docker
   1. From a terminal run `docker run -ti --rm -v /path/to/data:/data:ro bids/validator /data`
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

Please report any issues you experience while using these support targets. If
you experience issues outside of these supported environments and believe we
should extend our targeted support feel free to open a new issue describing the
issue, your support target and why you require extended support and we will
address these issues on a case by case basis.

## Maintainers and Contributors

This package is maintained by [@rwblair](https://github.com/rwblair/).

Some of our awesome contributors include:

[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/0)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/0)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/1)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/1)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/2)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/2)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/3)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/3)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/4)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/4)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/5)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/5)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/6)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/6)[![](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/images/7)](https://sourcerer.io/fame/chrisfilo/bids-standard/bids-validator/links/7)

## Use

#### API

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

#### .bidsignore

Optionally one can include a `.bidsignore` file in the root of the dataset. This
file lists patterns (compatible with the [.gitignore syntax](https://git-scm.com/docs/gitignore))
defining files that should be ignored by the validator. This option is useful
when the validated dataset includes file types not yet supported by BIDS
specification.

```Text
*_not_bids.txt
extra_data/
```

#### Configuration

You can configure the severity of errors by passing a json configuration file
with a `-c` or `--config` flag to the command line interface or by defining a
config object on the options object passed during javascript usage.

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

#### In the Browser

The BIDS Validator currently works in the browser with [browserify](http://browserify.org/)
or [webpack](https://webpack.js.org/). You can add it to a project by cloning
the validator and requiring it with browserify syntax
`var validate = require('bids-validator');` or an ES2015 webpack import
`import validate from 'bids-validator'`.

#### On the Server

The BIDS validator works like most npm packages. You can install it by running
`npm install bids-validator`.

#### Through Command Line

If you install the bids validator globally by using `npm install -g bids-validator`
you will be able to use it as a command line tool. Once installed you should be
able to run `bids-validator /path/to/your/bids/directory` and see any validation
issues logged to the terminal. Run `bids-validator` without a directory path to
see available options.

## Python Library

There are is a limited library of helper functions written in Python. The main function
determines if a file extension is compliant with the BIDS specification. You can find
the available functions in the library, as well as their descriptions,
[here](https://github.com/bids-standard/bids-validator/blob/master/bids-validator/bids_validator/bids_validator.py).
To install, run `pip install bids_validator` (requires python and pip).

#### Example

```
>>> from bids_validator import BIDSValidator
>>> validator = BIDSValidator()
>>> filepaths = ["/sub-01/anat/sub-01_rec-CSD_T1w.nii.gz", "/sub-01/anat/sub-01_acq-23_rec-CSD_T1w.exe"]
>>> for filepath in filepaths:
>>>     print( validator.is_bids(filepath) )
True
False
```

## Development

To develop locally, clone the project and run `yarn` from the project
root. This will install external dependencies. If you wish to install
`bids-validator` globally (so that you can run it in other folders), use the
following command to install it globally: `cd bids-validator && npm install -g`

#### Running Locally in a Browser

A note about OS X, the dependencies for the browser require a npm package called
node-gyp which needs xcode to be installed in order to be compiled.

1. The browser version of `bids-validator` lives in the repo subdirectory
	`/bids-validator-web`. It is a [React.js](https://reactjs.org/) application
	that uses the [next.js](https://nextjs.org/) framework.
2. To develop `bids-validator` and see how it will act in the browser, simply run
	`yarn web-develop` in the project root and navigate to `localhost:3000`.
3. In development mode, changes to the codebase will trigger rebuilds of the application
	automatically.
4. Changes to the `/bids-validator` in the codebase will also be reflected in the
	web application.
5. Tests use the [Jest](https://jestjs.io/index.html) testing library and should be developed in `/bids-validator-web/tests`.
	We can always use more tests, so please feel free to contribute a test that reduces the chance
	of any bugs you fix!
6. To ensure that the web application compiles successfully in production, run `yarn web-export`

#### Testing

To start the test suite run `npm test` from the project root. `npm test -- --watch`
is useful to run tests while making changes. A coverage report is available with
`npm run coverage`.

To run the linter which checks code conventions run `npm run lint`.
