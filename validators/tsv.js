var async  = require('async');

//from http://stackoverflow.com/questions/3410464/how-to-find-all-occurrences-of-one-string-in-another-in-javascript
function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
};

/**
 * TSV
 *
 * Takes a TSV file as a string and a callback
 * as arguments. And callsback with any errors
 * it finds while validating against the BIDS
 * specification.
 */
module.exports = function TSV (contents, callback) {

    var rows = contents.split('\n');
    var errors = [];
    var warnings = [];
    var headers = rows[0].split('\t');

    // check if headers begin with numbers
    for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        var firstChar = header[0];
        if (!isNaN(parseInt(firstChar))) {
            var newError = {
                evidence: header,
                line: 1,
                character: rows[0].indexOf(firstChar),
                reason: 'Headers may not begin with a number'
            }
            errors.push(newError);
        }
    }

    // iterate through rows
    rows.forEach(function (row) {
      //skip empty lines
      if (row.replace(/^\s\s*/, '').replace(/\s\s*$/, '') != '') {
          var columnsInRow = row.split('\t');

          // check for different length rows
          if (columnsInRow.length !== headers.length) {
              var newError = {
                  evidence: row,
                  line: rows.indexOf(row) + 1,
                  character: null,
                  reason: 'All rows must have the same number of columns as there are headers.'
              }
              errors.push(newError);
          }

          // check for two or more contiguous spaces
          var indices = getIndicesOf("  ", row, false);
          for (var i = 0, l = indices.length; i < l; i++){
              var newError = {
                  evidence: row,
                  line: rows.indexOf(row) + 1,
                  character: indices[i],
                  reason: 'Values may not contain adjacent spaces.'
              }
              errors.push(newError);
          }

          // iterated through colums
          columnsInRow.forEach(function (column) {
              // check if missing value is properly labeled as 'n/a'
              if (column === "NA" || column === "na" || column === "nan") {
                  var newError = {
                      evidence: row,
                      line: rows.indexOf(row) + 1,
                      character: row.indexOf('NA' || 'na' || 'nan'),
                      reason: 'A proper way of labeling missing values is "n/a".'
                  }

                  warnings.push(newError);
              }
          });
        }
    });
    callback(errors, warnings);
};
