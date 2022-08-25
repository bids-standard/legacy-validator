/**
 * Utilities for formatting human readable output (CLI or other UIs)
 */
import { prettyBytes } from '../deps/prettyBytes.ts'
import { cliffy } from '../deps/cliffy.ts'
import { colors } from '../deps/fmt.ts'
import { ValidationResult, SummaryOutput } from '../types/validation-result.ts'
import { Issue } from '../types/issues.ts'

interface LoggingOptions {
  verbose: boolean
}

/**
 * Format for Unix consoles
 *
 * Returns the full output string with newlines
 */
export function consoleFormat(
  result: ValidationResult,
  options?: LoggingOptions,
): string {
  const output = []
  if (result.issues.size === 0) {
    output.push(colors.green('This dataset appears to be BIDS compatible.'))
  } else {
    result.issues.forEach((issue) => output.push(formatIssue(issue, options)))
  }
  output.push('')
  output.push(formatSummary(result.summary))
  output.push('')
  return output.join('\n')
}

/**
 * Format one issue as text with colors
 */
function formatIssue(issue: Issue, options?: LoggingOptions): string {
  const severity = issue.severity
  const color = severity === 'error' ? 'red' : 'yellow'
  const output = []
  output.push(
    '\t' +
      colors[color](
        `[${severity.toUpperCase()}] ${issue.reason} (${issue.key})`,
      ),
  )
  output.push('')
  issue.files.forEach((file) => {
    output.push('\t\t.' + file.path)
    if (options?.verbose) {
      output.push('\t\t\t' + file.evidence)
    }
    if (file.line) {
      let msg = '\t\t\t@ line: ' + file.line
      if (file.character) {
        msg += ' character: ' + file.character
      }
      output.push(msg)
    }
    if (file.evidence) {
      output.push('\t\t\tEvidence: ' + file.evidence)
    }
  })
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
  return output.join('\n')
}

/**
 * Format for the summary
 */
function formatSummary(summary: SummaryOutput): string {
  const output = []
  const numSessions = summary.sessions.length > 0 ? summary.sessions.length : 1

  // data
  const column1 = [
      summary.totalFiles + ' ' + 'Files' + ', ' + prettyBytes(summary.size),
      summary.subjects.length +
        ' - ' +
        'Subjects ' +
        numSessions +
        ' - ' +
        'Sessions',
    ],
    column2 = summary.tasks,
    column3 = summary.modalities

  const longestColumn = Math.max(column1.length, column2.length, column3.length)
  const pad = '       '

  // headers
  const headers = [
    pad,
    colors.magenta('Summary:') + pad,
    colors.magenta('Available Tasks:') + pad,
    colors.magenta('Available Modalities:'),
  ]

  // rows
  const rows = []
  for (let i = 0; i < longestColumn; i++) {
    const val1 = column1[i] ? column1[i] + pad : ''
    const val2 = column2[i] ? column2[i] + pad : ''
    const val3 = column3[i] ? column3[i] : ''
    rows.push([pad, val1, val2, val3])
  }
  const table = new cliffy.Table()
    .header(headers)
    .body(rows)
    .border(false)
    .padding(1)
    .indent(2)
    .toString()

  output.push(table)

  output.push('')

  //Neurostars message
  output.push(
    colors.cyan(
      '\tIf you have any questions, please post on https://neurostars.org/tags/bids.',
    ),
  )

  return output.join('\n')
}
