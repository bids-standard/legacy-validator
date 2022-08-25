import utils from '../utils'
var Issue = utils.issues.Issue
import isNode from '../utils/isNode'

/**
 * dimensions and resolution
 *
 * Checks dimensions and resolution for x, y, z, and time across subjects to
 * ensure they are consistent.
 *
 * The fields we are interested in are all arrays and we are only looking at
 * the first for values in those arrays. To handle single values or longer
 * arrays more arguments will need to be added to headerField.
 */

const headerFields = (headers) => {
  var finalIssues = []
  var allIssues39Dict = {}
  var fields = ['dim', 'pixdim']

  /* turn a list of dicts into a dict of lists */
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i]
    var issues = headerField(headers, field)
    issues.forEach((issue) => {
      if (issue.code == 39) {
        if (allIssues39Dict.hasOwnProperty(issue.file.relativePath)) {
          allIssues39Dict[issue.file.relativePath].push(issue)
        } else {
          allIssues39Dict[issue.file.relativePath] = [issue]
        }
      } else {
        finalIssues.push(issue)
      }
    })
  }

  finalIssues = finalIssues.concat(collect39Issues(allIssues39Dict))

  return finalIssues
}

const collect39Issues = (allIssues39Dict) => {
  const finalIssues = []
  for (let file of Object.keys(allIssues39Dict)) {
    const firstIssue = allIssues39Dict[file][0]
    let evidence = ''
    for (var issue of allIssues39Dict[file]) {
      evidence = evidence + ' ' + issue.reason
    }
    firstIssue.reason = evidence
    finalIssues.push(firstIssue)
  }
  return finalIssues
}

/**
 * Key to headerField working is the fact that we take and array of values
 * from the nifti header and convert it to a string. This string is used to
 * compare the header field value against other header field values and is used
 * as an attribute in the object nifti_types. Nifti types refers to the
 * different types of nifti files we are comparing across subjects. Only the
 * dimensionality of similar anatomy/functional/dwi headers are being compared.
 */

const headerField = (headers, field) => {
  var nifti_types = {}
  var issues = []
  for (var header_index = 0; header_index < headers.length; header_index++) {
    var badField = false
    var field_value
    var file = headers[header_index][0]
    var filename
    var header = headers[header_index][1]
    var match
    var path = file.relativePath
    var subject

    if (field === 'dim') {
      if (
        typeof header[field] === 'undefined' ||
        header[field] === null ||
        header[field].length < header[field][0]
      ) {
        issues.push(
          new Issue({
            file: file,
            code: 40,
          }),
        )
        continue
      } else if (
        file.name.indexOf('_bold') > -1 &&
        (header[field][0] !== 4 || header[field].length !== 5)
      ) {
        issues.push(
          new Issue({
            file: file,
            code: 54,
            evidence: 'header field "dim" = ' + header[field],
          }),
        )
        continue
      } else if (
        (file.name.indexOf('magnitude1') > -1 ||
          file.name.indexOf('magnitude2') > -1) &&
        header[field].length !== 4
      ) {
        issues.push(
          new Issue({
            file: file,
            code: 94,
            evidence: 'this magnitude file has more than three dimensions. ',
          }),
        )
        continue
      } else if (file.name.indexOf('T1w') > -1 && header[field].length !== 4) {
        issues.push(
          new Issue({
            file: file,
            code: 95,
            evidence: 'this T1w file does not have exactly three dimensions. ',
          }),
        )
      }
      field_value = header[field].slice(1, header[field][0] + 1).toString()
    } else if (field === 'pixdim') {
      if (
        typeof header['xyzt_units'] === 'undefined' ||
        header['xyzt_units'] === null ||
        header['xyzt_units'].length < 4
      ) {
        issues.push(
          new Issue({
            file: file,
            code: 41,
          }),
        )
        badField = true
      }
      if (
        typeof header['pixdim'] === 'undefined' ||
        header['pixdim'] === null ||
        header['pixdim'].length < 4
      ) {
        issues.push(
          new Issue({
            file: file,
            code: 42,
          }),
        )
        badField = true
      }
      if (header['qform_code'] === 0 && header['sform_code'] === 0) {
        issues.push(
          new Issue({
            file: file,
            code: 60,
          }),
        )
        badField = true
      }
      if (badField === true) {
        continue
      }
      field_value = []
      var pix_dim = header[field].slice(1, 5)
      var units = header['xyzt_units'].slice(0, 4)
      for (var i = 0; i < pix_dim.length; i++) {
        field_value.push('' + pix_dim[i].toFixed(2) + units[i])
      }
      field_value = field_value.toString()
    } else {
      console.warn(
        'Checks against header field: ' + field + ' are currently unsupported.',
      )
      return
    }

    if (!file || (!isNode && !file.webkitRelativePath)) {
      continue
    }

    //match the subject identifier up to the '/' in the full path to a file.
    match = path.match(/sub-(.*?)(?=\/)/)
    if (match === null) {
      continue
    } else {
      subject = match[0]
    }
    // files are prepended with subject name, the following two commands
    // remove the subject from the file name to allow filenames to be more
    // easily compared
    filename = path.substring(path.match(subject).index + subject.length)
    filename = filename.replace(subject, '<sub>')

    // generalize the run number so we can compare counts across all runs
    match = filename.match(/run-\d+/)
    if (match !== null) {
      filename = filename.replace(match[0], '<run>')
    }

    if (!nifti_types.hasOwnProperty(filename)) {
      nifti_types[filename] = {}
      nifti_types[filename][field_value] = { count: 1, files: [file] }
    } else {
      if (!nifti_types[filename].hasOwnProperty(field_value)) {
        nifti_types[filename][field_value] = { count: 1, files: [file] }
      } else {
        nifti_types[filename][field_value].count += 1
        nifti_types[filename][field_value].files.push(file)
      }
    }
  }
  for (let nifti_key of Object.keys(nifti_types)) {
    const nifti_type = nifti_types[nifti_key]
    let max_field_value = Object.keys(nifti_type)[0]
    for (let field_value_key in nifti_type) {
      if (nifti_type.hasOwnProperty(field_value_key)) {
        field_value = nifti_type[field_value_key]
        if (field_value.count > nifti_type[max_field_value].count) {
          max_field_value = field_value_key
        }
      }
    }
    for (let field_value_key of Object.keys(nifti_type)) {
      field_value = nifti_type[field_value_key]
      if (
        max_field_value !== field_value_key &&
        headerFieldCompare(max_field_value, field_value_key)
      ) {
        for (
          var nifti_file_index = 0;
          nifti_file_index < field_value.files.length;
          nifti_file_index++
        ) {
          var nifti_file = field_value.files[nifti_file_index]
          var evidence
          if (field === 'dim') {
            evidence =
              'The most common set of dimensions is: ' +
              max_field_value +
              ' (voxels), This file has the dimensions: ' +
              field_value_key +
              ' (voxels).'
          } else if (field === 'pixdim') {
            evidence =
              'The most common resolution is: ' +
              max_field_value.replace(/,/g, ' x ') +
              ', This file has the resolution: ' +
              field_value_key.replace(/,/g, ' x ') +
              '.'
          }
          issues.push(
            new Issue({
              file: nifti_file,
              reason: evidence,
              code: 39,
            }),
          )
        }
      }
    }
  }
  return issues
}

/**
 * if elements of the two arrays differ by less than one we won't raise a
 * warning about them. There are a large number of floating point rounding
 * errors that cause resolutions to be slightly different. Returns true if
 * the two headers are significantly different
 */
const headerFieldCompare = (header1, header2) => {
  var hdr1 = header1.split(',')
  var hdr2 = header2.split(',')
  if (hdr1.length !== hdr2.length) {
    return true
  }
  for (var i = 0; i < hdr1.length; i++) {
    var hdr1_val = Number(hdr1[i].match(/-?\d*\.?\d*/))
    var hdr2_val = Number(hdr2[i].match(/-?\d*\.?\d*/))
    // Matching alphas with * will return '' on headers without units
    var hdr1_unit = hdr1[i].match(/[A-Za-z]*$/)[0]
    var hdr2_unit = hdr2[i].match(/[A-Za-z]*$/)[0]
    if (Math.abs(hdr1_val - hdr2_val) > 0.00001) {
      return true
    }
    if (hdr1_unit !== hdr2_unit) {
      return true
    }
  }
  return false
}

export default headerFields
export { collect39Issues }
