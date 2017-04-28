![](https://circleci.com/gh/INCF/bids-validator.svg?style=shield&circle-token=:circle-token)

# BIDS-Validator
test
## Quickstart

1. Web version:
   1. Open [Google Chrome](https://www.google.com/chrome/) (currently the only supported browser)
   1. Go to http://incf.github.io/bids-validator/ and select a folder with your BIDs dataset.
1. Command line version:
   1. Install [Node.js](https://nodejs.org) (at least version 4.4.4)
   1. From a terminal run `npm install -g bids-validator`
   1. Run `bids-validator` to start validating datasets.

## Support

The BIDS Validator is designed to work in both the browser and in Node.js. We target support for the latest long term stable (LTS) release of Node.js and the latest version of Chrome.

Please report any issues you experience while using these support targets. If you experience issues outside of these supported environments and believe we should extend our targeted support feel free to open a new issue describing the issue, your support target and why you require extended support and we will address these issues on a case by case basis.

## Use

#### API

The BIDS Validator has one primary method that takes a directory as either a path to the directory (node) or the object given by selecting a directory with a file input (browser), an options object, and a callback.

Available options include:
* ignoreWarnings - (boolean - defaults to false)
* ignoreNiftiHeaders - (boolean - defaults to false)

For example:

```validate.BIDS(directory, {ignoreWarnings: true}, function (errors, warnings) {console.log(errors, warnings);});```

If you would like to test individual files you can use the file specific checks that we expose.
* validate.BIDS()
* validate.JSON()
* validate.TSV()
* validate.NIFTI()

Additionally you can reformat stored errors against a new config using `validate.reformat()`

#### Configuration

You can configure the severity of errors by passing a json configuration file with a --c or --config flag to the command line interface or by defining a config object on the options object passed during javascript usage.

The basic configuration format is outlined below. All configuration is optional.

    {
    	"ignore": [],
    	"warn": [],
    	"error": [],
    	"ignoredFiles": []
    }

`ignoredFiles` takes a list of file paths or glob patterns you'd like to ignore.

`ignore`, `warn`, and `error` take lists of issue codes or issue keys and change the severity of those issues so they are either ignored or reported as warnings or errors. You can find a list of all available issues at [utils/issues/list](https://github.com/INCF/bids-validator/tree/master/utils/issues/list.js).

Some issues may be ignored by default, but can be elevated to warnings or errors. These provide a way to check for common things that are more specific than BIDS compatibility. An example is a check for the presence of a T1w modality. The following would raise an error if no T1W image was found in a dataset.

{
	"error": ["NO_T1W"]
}

In addition to issue codes and keys these lists can also contain objects with and "and" or "or" properties set to arrays of codes or keys. These allow some level of conditional logic when configuring issues. For example:

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

In the above example the two issues will only be ignored if both of them are triggered during validation.

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

And in this example the listed issues will only be ignored if `ECHO_TIME_GREATER_THAN`, `ECHO_TIME_NOT_DEFINED` and either `ECHO_TIME1-2_NOT_DEFINED` or `ECHO_TIME_MUST_DEFINE` are triggered during validation.

"or" arrays are not supported at the lowest level because it wouldn't add any functionality. For example the following is not supported.

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

because it would be functionally the same as this

	{
		"ignore": [
			"ECHO_TIME_GREATER_THAN",
			"ECHO_TIME_NOT_DEFINED"
		]
	}

#### In the Browser

The BIDS Validator currently works in the browser with [browserify](http://browserify.org/). You can add it to a browserify project by cloning the validator and requiring it with browserify syntax ```var validate = require('bids-validator');```.

#### On the Server

The BIDS validator works like most npm packages. You can install it by running ```npm install bids-validator```.

#### Through Command Line

If you install the bids validator globally by using ```npm install -g bids-validator``` you will be able to use it as a command line tool. Once installed you should be able to run ```bids-validator /path/to/your/bids/directory``` and see any validation issues logged to the terminal. Run ```bids-validator``` without a directory path to see available options.

## Development

To develop locally, clone the project and run ```npm install``` from the project root. This will install external dependencies.

#### Running Locally in a Browser

A note about OS X, the dependencies for the browser require a npm package called node-gyp which needs xcode to be installed in order to be compiled.

1. Create a separate directory with the gh-pages branch in it.
2. The local version of the validator needs to be added to npm. This is done through the command `npm --save relative/path/to/bids-validator`.
3. In the gh-pages package.json file replace `bids-validator: "latest"` with `bids-validator: "relative/path/to/bids-validator` so if the normal bids-validator project is in the same directory as the gh-pages project this line would read `bids-validator: "../bids-validator". This will install your local version of the bids-validator project instead of going to the central npm repository.
4. The default gh-pages application minifies javascript. This make it difficult to test things locally. To disable minification of javascript comment out the line `.pipe(uglify())` in gulpfule.js
5. In the gh-pages directory execute `npm install` and then `gulp build` this will install all the dependencies of the bids-validator browser application and build it.
6. Any subsequent changes to the bids-validator will require the source to be reinstalled and the gh-pages application rebuilt. From the gh-pages directory a one liner to do this is `rm -rv node_modules/bids-validator/ && npm install && gulp build` The rm removes the installed version of bids-validator, npm install will recopy it from your local repositroy, and then finally the gulp rebuild.
7. Via Chrome you can now open the index.html in gh-pages generated by gulp.

#### Testing

To start the test suite run ```npm test``` from the project root.

To run the linter which checks code conventions run ```npm run lint```.
