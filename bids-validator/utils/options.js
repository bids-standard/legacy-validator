import path from 'path'
import getFileStats from '../utils/files/getFileStats'
import readFile from '../utils/files/readFile'
import json from './json'
import isNode from '../utils/isNode.js'

let options

export default {
  /**
   * Parse
   */
  parse: function (dir, args, callback) {
    options = args ? args : {}
    options = {
      ignoreWarnings: Boolean(options.ignoreWarnings),
      ignoreNiftiHeaders: Boolean(options.ignoreNiftiHeaders),
      ignoreSymlinks: Boolean(options.ignoreSymlinks),
      ignoreSubjectConsistency: Boolean(options.ignoreSubjectConsistency),
      blacklistModalities: options.blacklistModalities,
      verbose: Boolean(options.verbose),
      gitTreeMode: Boolean(options.gitTreeMode),
      remoteFiles: Boolean(options.remoteFiles),
      gitRef: options.gitRef || 'HEAD',
      config: options.config || {},
      schema: options.schema !== 'disable' ? options.schema : false,
    }
    if (options.config && typeof options.config !== 'boolean') {
      this.parseConfig(dir, options.config, function (issues, config) {
        options.config = config
        callback(issues, options)
      })
    } else {
      callback(null, options)
    }
  },

  getOptions: () => {
    const readonlyOptions = Object.freeze({ ...options })
    return readonlyOptions
  },

  /**
   * Load Config
   */
  loadConfig: function (dir, config, callback) {
    if (typeof config === 'string') {
      let configFile
      if (isNode) {
        const configPath = path.isAbsolute(config)
          ? config
          : path.join(dir, config)
        configFile = { path: configPath }
      } else {
        // Grab file from FileList if a path was provided
        configFile = [...dir].find((f) => f.webkitRelativePath === config)
        // No matching config, return a default
        if (!configFile) {
          return callback(null, configFile, JSON.stringify({}))
        }
      }
      configFile.stats = getFileStats(configFile)
      readFile(configFile)
        .then((contents) => {
          callback(null, configFile, contents)
        })
        .catch((issue) => {
          // If the config does not exist, issue 44 is returned
          if (issue.code === 44) {
            callback(null, configFile, JSON.stringify({}))
          } else {
            callback([issue], configFile, null)
          }
        })
    } else if (typeof config === 'object') {
      callback(null, { path: 'config' }, JSON.stringify(config))
    }
  },

  /**
   * Parse Config
   */
  parseConfig: function (dir, config, callback) {
    this.loadConfig(dir, config, function (issues, file, contents) {
      if (issues) {
        callback(issues, null)
      } else {
        json.parse(file, contents).then(({ issues, parsed: jsObj }) => {
          if (issues && issues.length > 0) {
            callback(issues, null)
          } else {
            const parsedConfig = {
              ignore: jsObj.ignore ? [].concat(jsObj.ignore) : [],
              warn: jsObj.warn ? [].concat(jsObj.warn) : [],
              error: jsObj.error ? [].concat(jsObj.error) : [],
              ignoredFiles: jsObj.ignoredFiles
                ? [].concat(jsObj.ignoredFiles)
                : [],
            }
            callback(null, parsedConfig)
          }
        })
      }
    })
  },
}
