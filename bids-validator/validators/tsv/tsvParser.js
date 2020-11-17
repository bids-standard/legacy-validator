/*
 * TSV
 * Module for parsing TSV (and eventually other formats)
 */

const normalizeEOL = str => str.replace('\r\n', '\n').replace('\r', '\n')
const isContentfulRow = row => row && !/^\s*$/.test(row)

function parseTSV(contents) {
  const content = {
    headers: [],
    rows: [],
  }
  content.rows = normalizeEOL(contents)
    .split('\n')
    .filter(isContentfulRow)
    .map(str => str.split('\t'))
  content.headers = content.rows.length ? content.rows[0] : [] 
  return content
}

export default parseTSV
