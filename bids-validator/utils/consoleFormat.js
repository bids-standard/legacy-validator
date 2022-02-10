import colors from 'colors/safe'
import { table, getBorderCharacters } from 'table'
import pluralize from 'pluralize'
import bytes from 'bytes'

export default {
  issues: formatIssues,
  summary: formatSummary,
  logIssues,
  unexpectedError,
}

function unexpectedError(message) {
  return colors.red(message)
}

function formatIssues(issues, options = {}) {
  var errors = issues.errors
  var warnings = issues.warnings
  var output = []
  if (issues.errors.length === 1 && issues.errors[0].code === '61') {
    output.push(
      colors.red(
        '[ERR]  The given directory failed an initial Quick Test. This means the basic names and structure of the files and directories do not comply with BIDS specification. For more info go to http://bids.neuroimaging.io/',
      ),
    )
  } else if (issues.config && issues.config.length >= 1) {
    output.push(colors.red('[ERR]  Invalid Config File'))
    for (var i = 0; i < issues.config.length; i++) {
      var issue = issues.config[i]
      issue.file.file = { relativePath: issue.file.path }
      issue.files = [issue.file]
    }
    output = output.concat(logIssues(issues.config, 'red', options))
  } else if (errors.length >= 1 || warnings.length >= 1) {
    output = output.concat(logIssues(errors, 'red', options))
    output = output.concat(logIssues(warnings, 'yellow', options))
  } else {
    output.push(colors.green('This dataset appears to be BIDS compatible.'))
  }
  return output.join('\n')
}

function logIssues(issues, color, options) {
  const severity = color == 'red' ? 'ERR' : 'WARN'
  const output = []
  for (var i = 0; i < issues.length; i++) {
    const issue = issues[i]
    const issueNumber = i + 1
    output.push(
      '\t' +
        colors[color](
          issueNumber +
            ': ' +
            `[${severity}] ` +
            issue.reason +
            ' (code: ' +
            issue.code +
            ' - ' +
            issue.key +
            ')',
        ),
    )
    for (var j = 0; j < issue.files.length; j++) {
      var file = issues[i].files[j]
      if (!file || !file.file) {
        continue
      }
      let indent = '\t\t'
      if (file.file.relativePath) {
        output.push(`${indent}.` + file.file.relativePath)
        indent = '\t\t\t'
      }
      if (options.verbose) {
        output.push(indent + file.reason)
      }
      if (file.line) {
        var msg = `${indent}@ line: ` + file.line
        if (file.character) {
          msg += ' character: ' + file.character
        }
        output.push(msg)
      }
      if (file.evidence) {
        output.push(`${indent}Evidence: ` + file.evidence)
      }
    }
    if (issue.additionalFileCount > 0) {
      output.push(
        '\t\t' +
          colors[color](
            '... and ' +
              issue.additionalFileCount +
              ' more files having this issue (Use --verbose to see them all).',
          ),
      )
    }
    output.push('')
    if (issue.helpUrl) {
      output.push(
        colors.cyan(
          '\t' +
            'Please visit ' +
            issue.helpUrl +
            ' for existing conversations about this issue.',
        ),
      )
      output.push('')
    }
  }
  return output
}

function formatSummary(summary) {
  const output = []
  if (summary) {
    var numSessions = summary.sessions.length > 0 ? summary.sessions.length : 1

    // data
    var column1 = [
        summary.totalFiles +
          ' ' +
          pluralize('File', summary.totalFiles) +
          ', ' +
          bytes(summary.size),
        summary.subjects.length +
          ' - ' +
          pluralize('Subject', summary.subjects.length),
        numSessions + ' - ' + pluralize('Session', numSessions),
      ],
      column2 = summary.tasks,
      column3 = summary.modalities

    var longestColumn = Math.max(column1.length, column2.length, column3.length)
    var pad = '       '

    // headers
    var headers = [
      pad,
      colors.blue.underline('Summary:') + pad,
      colors.blue.underline('Available Tasks:') + pad,
      colors.blue.underline('Available Modalities:'),
    ]

    // rows
    var rows = [headers]
    for (var i = 0; i < longestColumn; i++) {
      var val1, val2, val3
      val1 = column1[i] ? column1[i] + pad : ''
      val2 = column2[i] ? column2[i] + pad : ''
      val3 = column3[i] ? column3[i] : ''
      rows.push([pad, val1, val2, val3])
    }
    output.push(
      table(rows, {
        border: getBorderCharacters(`void`),
        columnDefault: {
          paddingLeft: 0,
          paddingRight: 1,
        },
        drawHorizontalLine: () => {
          return false
        },
      }),
    )

    output.push('')

    //Neurostars message
    output.push(
      colors.cyan(
        '\tIf you have any questions, please post on https://neurostars.org/tags/bids.',
      ),
    )

    output.push('')
  }
  return output.join('\n')
}
