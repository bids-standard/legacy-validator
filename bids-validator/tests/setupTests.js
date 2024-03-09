// Mock sessionStorage
global.sessionStorage = {
  getItem: (key) => sessionStorage[key],
  setItem: (key, value) => {
    sessionStorage[key] = value
  },
  removeItem: (key) => {
    delete sessionStorage[key]
  },
  clear: () => {
    Object.keys(sessionStorage).forEach((key) => sessionStorage.removeItem(key))
  },
}
