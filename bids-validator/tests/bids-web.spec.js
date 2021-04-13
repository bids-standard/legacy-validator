/**
 * eslint no-console: ["error", { allow: ["log"] }]
 * @jest-environment jsdom
 */

// Work around JSDom not providing TextDecoder yet
if (typeof TextDecoder === 'undefined') {
  const { TextDecoder } = require('util')
  global.TextDecoder = TextDecoder
}

import './bids.spec.js'
