import isNode from '../isNode'
import fs from 'fs'

const readBuffer = (file) => {
  return new Promise((resolve, reject) => {
    if (isNode) {
      resolve(fs.readFileSync(file.path))
    } else {
      try {
        const reader = new FileReader()
        reader.onload = (event) => {
          resolve(event.target.result)
        }

        reader.readAsArrayBuffer(file)
      } catch (e) {
        reject(e)
      }
    }
  })
}

export default readBuffer
