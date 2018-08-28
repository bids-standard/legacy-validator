var files = require('./files')
var json = require('./json')

module.exports = {
  /**
   * Parse
   */
  parse: function(options, callback) {
    options = options ? options : {}
    options = {
      ignoreWarnings: !!options.ignoreWarnings,
      ignoreNiftiHeaders: !!options.ignoreNiftiHeaders,
      verbose: !!options.verbose,
      bep006: !!options.bep006,
      bep010: !!options.bep010,
      config: options.config ? options.config : {},
    }
    if (options.config && typeof options.config !== 'boolean') {
      this.parseConfig(options.config, function(issues, config) {
        options.config = config
        callback(issues, options)
      })
    } else {
      callback(null, options)
    }
  },

  /**
   * Load Config
   */
  loadConfig: function(config, callback) {
    if (typeof config === 'string') {
      // load file
      files.readFile({ path: config }, function(issue, contents) {
        if (issue) {
          callback([issue], { path: config }, null)
        } else {
          callback(null, { path: config }, contents)
        }
      })
    } else if (typeof config === 'object') {
      callback(null, { path: 'config' }, JSON.stringify(config))
    }
  },

  /**
   * Parse Config
   */
  parseConfig: function(config, callback) {
    let parsed = { ignore: [], warn: [], error: [], ignoredFiles: [] }
    this.loadConfig(config, function(issues, file, contents) {
      if (issues) {
        callback(issues, null)
      } else {
        json.parse(file, contents, function(issues, jsObj) {
          if (issues && issues.length > 0) {
            callback(issues, null)
          } else {
            parsed.ignore = jsObj.ignore ? jsObj.ignore : []
            parsed.warn = jsObj.warn ? jsObj.warn : []
            parsed.error = jsObj.error ? jsObj.error : []
            parsed.ignoredFiles = jsObj.ignoredFiles ? jsObj.ignoredFiles : []
            callback(null, parsed)
          }
        })
      }
    })
  },
}
