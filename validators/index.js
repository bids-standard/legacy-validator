// dependencies ------------------------------------------------------

var TSV    = require('./tsv');
var JSON   = require('./json');
var NIFTI  = require('./nii');
var BIDS   = require('./bids').start;
var BIDSS   = require('./bids').fullTest;

var bval   = require('./bval');
var bvec   = require('./bvec');
var utils  = require('../utils');

// public api --------------------------------------------------------

var validate = {
	BIDS: BIDS,
	BIDSS: BIDSS,
	JSON: JSON,
	TSV: TSV,
	NIFTI: NIFTI,
	bval: bval,
	bvec: bvec,
	reformat: utils.issues.reformat
};

// exports -----------------------------------------------------------

module.exports = validate;
