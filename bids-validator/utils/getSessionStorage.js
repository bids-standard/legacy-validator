// return sessionStorage based on environment
// uses mock object for use in tests and GitHub workflows
import isNode from './isNode'

function getSessionStorage() {
  if ('sessionStorage' in global) {
    // created in setupTests.js; enables data sharing using same object
    return global.sessionStorage
  } else if (!isNode) {
    return window.sessionStorage
  } else {
    const sessionStorage = {}

    return {
      getItem: (key) => sessionStorage[key],
      setItem: (key, value) => {
        sessionStorage[key] = value
      },
      removeItem: (key) => {
        delete sessionStorage[key]
      },
      clear: () => {
        Object.keys(sessionStorage).forEach((key) =>
          sessionStorage.removeItem(key),
        )
      },
    }
  }
}

export default getSessionStorage
