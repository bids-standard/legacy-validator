/**
 * Abstract .bidsignore handler
 */
export interface FileIgnoreRules {
  add: (config: string[]) => void
  test: (path: string) => boolean
}
