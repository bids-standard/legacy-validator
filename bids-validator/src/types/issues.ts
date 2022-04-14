export const warning = Symbol('warning')
export const error = Symbol('error')
export const ignore = Symbol('ignore')
type Severity = typeof warning | typeof error | typeof ignore

export interface IssueFileDetail {
  name: string
  path: string
  relativePath: string
}

export interface IssueFile {
  key: string
  code: number
  file: IssueFileDetail
  evidence: String
  line: number
  character: number
  severity: Severity
  reason: string
  helpUrl: string
}

/**
 * Dataset issue, derived from OpenNeuro schema and existing validator implementation
 */
export interface Issue {
  severity: Severity
  key: string
  code: number
  reason: string
  files: [IssueFile?]
  additionalFileCount: number
  helpUrl: string
}
