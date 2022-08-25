import { BIDSFile } from './file.ts'

export type Severity = 'warning' | 'error' | 'ignore'

export interface IssueFileDetail {
  name: string
  path: string
  relativePath: string
}

export interface IssueFileOutput {
  key: string
  code: number
  file: IssueFileDetail
  evidence: string
  line: number
  character: number
  severity: Severity
  reason: string
  helpUrl: string
}

/**
 * Dataset issue, derived from OpenNeuro schema and existing validator implementation
 */
export interface IssueOutput {
  severity: Severity
  key: string
  code: number
  reason: string
  files: IssueFileOutput[]
  additionalFileCount: number
  helpUrl: string
}

/**
 * Shape returned by fullTest call in non-schema validator
 */
export interface FullTestIssuesReturn {
  errors: IssueOutput[]
  warnings: IssueOutput[]
}

/**
 * For defining internal issues quickly
 */
export interface IssueDefinition {
  severity: Severity
  reason: string
}
export type IssueDefinitionRecord = Record<string, IssueDefinition>

/**
 * File allowing extra context for the issue found
 */
export type IssueFile = BIDSFile & {
  evidence?: string
  line?: number
  character?: number
}

/**
 * Updated internal Issue structure for schema based validation
 */
export class Issue {
  key: string
  severity: Severity
  reason: string
  files: Map<string, IssueFile>

  constructor({
    key,
    severity,
    reason,
    files,
  }: {
    key: string
    severity: Severity
    reason: string
    files: Map<string, IssueFile> | IssueFile[]
  }) {
    this.key = key
    this.severity = severity
    this.reason = reason
    // We want to be able to easily look up by path, so turn IssueFile[] into a Map
    if (Array.isArray(files)) {
      this.files = new Map()
      for (const f of files) {
        this.files.set(f.path, f)
      }
    } else {
      this.files = files
    }
  }

  get helpUrl(): string {
    // Provide a link to NeuroStars
    return `https://neurostars.org/search?q=${this.key}`
  }
}
