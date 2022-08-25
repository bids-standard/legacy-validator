import ExifReader from 'exifreader'
const xml2js = require('xml2js')

const readOMEFile = (buffer) => {
  let tags = ExifReader.load(buffer)
  let xml = tags['ImageDescription']['description']
  return new Promise((resolve, reject) => {
    xml2js
      .parseStringPromise(xml)
      .then((result) => {
        resolve(result)
      })
      .catch((error) => reject(error))
  })
}

export default readOMEFile
