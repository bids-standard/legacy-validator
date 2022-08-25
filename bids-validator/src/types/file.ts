/**
 * Abstract validation File for all environments (Deno, Browser, Python)
 */

// Avoid overloading the default File type
export interface BIDSFile {
  // Filename
  name: string
  // Dataset relative path for the file
  path: string
  // File size in bytes
  size: number
  // BIDS ignore status of the file
  ignored: boolean
  // ReadableStream to file raw contents
  stream: ReadableStream<Uint8Array>
  // Resolve stream to decoded utf-8 text
  text: () => Promise<string>
}
