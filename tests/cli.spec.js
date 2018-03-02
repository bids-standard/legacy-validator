var assert   = require('assert');
var cli = require('../cli');
var test_version = "1.0.0-rc3u5";

describe('cli', function(){

	it('should check if the cli program run without error', function(){
    var options = {ignoreNiftiHeaders: true};
		var returned = cli("tests/data/BIDS-examples-" + test_version + "/ds001", options);
    assert(returned === 'success');
	});

  it('should check if the dir doesn\'t exist', function(){
    var options = {ignoreNiftiHeaders: true};
		var returned = cli("does_not_exist/" + test_version + "/ds001", options);
    assert(returned === 'noDir');
	});
});
