//import buildRegExp from '../../utils/type'
//import conditionalMatch from '../../utils/type'

const Issue = require('../../utils').issues.Issue

const regExpSamples = buildRegExp({
  "regexp": "^[\\/\\\\](sub-[a-zA-Z0-9]+)[\\/\\\\](?:(ses-[a-zA-Z0-9]+)[\\/\\\\])?microscopy[\\/\\\\](sub-[a-zA-Z0-9]+)(?:(_ses-[a-zA-Z0-9]+))?(_sample-[a-zA-Z0-9]+)(?:_chunk-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_stain-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(@@@_microscopy_type_@@@)(@@@_microscopy_ext_@@@)$",
  "tokens": {
    "@@@_microscopy_type_@@@": ["_tem","_sem","_ct","_bf","_df","_pc","_dic","_fluo","_conf","_pli","_cars","_2pe","_mpe","_sr","_nlo","_oct","_spim"],
    "@@@_microscopy_ext_@@@": [".ome\\.tif",".ome\\.btf",".tif",".png",".json"]
  }
})


const checkSamples = tsvContentsDict => {
  let issues = []
  const tsvFilePaths = Object.keys(tsvContentsDict)

  const hasSamples = tsvFilePaths.some(path => {
    return path == '/samples.tsv'})

  if (!hasSamples) {
    issues.push(new Issue({ code: 214 }))
  } else { }
  return issues
}

export default checkSamples


// from '../../utils/type.js', the two following functions are used:

function conditionalMatch(expression, path) {
  var match = expression.exec(path)

  // we need to do this because JS does not support conditional groups
  if (match) {
    if ((match[2] && match[3]) || !match[2]) {
      return true
    }
  }
  return false
}

/**
 * Insert tokens into RegExps from bids-validator-common
 */
function buildRegExp(obj) {
  if (obj.tokens) {
    let regExp = obj.regexp
    const keys = Object.keys(obj.tokens)
    for (let key of keys) {
      const args = obj.tokens[key].join('|')
      regExp = regExp.replace(key, args)
    }
    return new RegExp(regExp)
  } else {
    return new RegExp(obj.regexp)
  }
}
