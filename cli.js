var validate = require('./index.js');
var colors = require('colors/safe');
var fs = require('fs')

module.exports = function (dir) {
	if (fs.existsSync(dir)) {
	    validate.BIDS(dir, function (errors, warnings) {
	        console.log();
	    	if (errors === 'Invalid') {
	    		console.log(colors.red("This does not appear to be a BIDS dataset. For more info go to http://bids.neuroimaging.io/"));
	    	} else if (errors.length > 0 || warnings.length > 0) {
		        logIssues(errors, 'red');
		        logIssues(warnings, 'yellow');
	      } else {
	        console.log(colors.green("This dataset is compatible with BIDS."));
				}
	    });
	} else {
		console.log(colors.red(dir + " does not exits"))
	}
};

function logIssues (issues, color) {
	for (var i = 0; i < issues.length; i++) {
    	console.log('\t' + colors[color](issues[i].path));
    	for (var j = 0; j < issues[i].errors.length; j++) {
    		var error = issues[i].errors[j];
    		if (error) {
	    		console.log('\t' + error.reason);
					var where = '\t@ line: ' + error.line
					if (error.character != null) {
						where += ' character: ' + error.character
					}
	    		console.log(where);
	    		console.log('\t' + error.evidence);
					if (error.severity) {
	    			console.log('\t' + error.severity);
					}
	    		console.log();
    	}
    }
	}
}
