// import validations
import validate from '../validators'

// Work around JSDom not providing TextDecoder yet
if (typeof TextDecoder === 'undefined') {
  const { TextDecoder } = require('util')
  global.TextDecoder = TextDecoder
}

// export validations for use in other applications
module.exports = validate
