import isNode from '../isNode'
import ExifReader from 'exifreader'
const xml2js = require('xml2js')

const readOMEFile = async omeFile => {
  let tags
  if (isNode) {
    tags = await ExifReader.load(omeFile.path)
  } else {
    const arrayBuffer = await toArrayBuffer(omeFile)
    tags = await ExifReader.load(arrayBuffer)
  }
  let xml = tags['ImageDescription']['description']
  let parser = new xml2js.Parser()
  return await parser.parseStringPromise(xml)
}

const toArrayBuffer = async file => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onload = event => {
        resolve(event.target.result)
      }

      reader.readAsArrayBuffer(file)
    } catch (e) {
      reject(e)
    }
  })
}

export default readOMEFile
