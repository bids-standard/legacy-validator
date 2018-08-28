const async = require('async')
const fs = require('fs')

function collectDirectoryStatistics(fileList, summary) {
  async.eachOfLimit(fileList, 200, function(file) {
    // collect file stats
    if (typeof window !== 'undefined') {
      if (file.size) {
        summary.size += file.size
      }
    } else {
      if (!file.stats) {
        try {
          file.stats = fs.statSync(file.path)
        } catch (err) {
          file.stats = { size: 0 }
        }
      }
      summary.size += file.stats.size
    }
  })
}
module.exports = collectDirectoryStatistics
