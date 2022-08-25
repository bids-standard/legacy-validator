/*
 * TSV
 * Module for parsing TSV (and eventually other formats)
 */

const stripBOM = (str) => str.replace(/^\uFEFF/, '')
const normalizeEOL = (str) => str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
const isContentfulRow = (row) => row && !/^\s*$/.test(row)

function parseTSV(contents) {
  const content = {
    headers: [],
    rows: [],
  }
  contents = stripBOM(contents)
  content.rows = normalizeEOL(contents)
    .split('\n')
    .filter(isContentfulRow)
    .map((str) => str.split('\t'))
  content.headers = content.rows.length ? content.rows[0] : []
  return content
}

export default parseTSV
