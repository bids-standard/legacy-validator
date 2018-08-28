/**
 * Potential Locations
 *
 * Takes the path to the lowest possible level of
 * a file that can be hierarchily positioned and
 * return a list of all possible locations for that
 * file.
 */
function potentialLocations(path) {
  var potentialPaths = [path]
  var pathComponents = path.split('/')
  var filenameComponents = pathComponents[pathComponents.length - 1].split('_')

  const components = extractComponents(filenameComponents)

  if (components.ses) {
    addPotentialPaths(
      components.sessionLevelComponentList,
      potentialPaths,
      2,
      '/' + components.sub + '/' + components.ses + '/',
    )
  }
  addPotentialPaths(
    components.subjectLevelComponentList,
    potentialPaths,
    1,
    '/' + components.sub + '/',
  )
  addPotentialPaths(components.topLevelComponentList, potentialPaths, 0, '/')
  potentialPaths.reverse()

  return potentialPaths
}

function extractComponents(filenameComponents) {
  let components = {
    ses: null,
    sub: null,
    topLevelComponentList: [],
    sessionLevelComponentList: [],
    subjectLevelComponentList: [],
  }

  filenameComponents.forEach(function(filenameComponent) {
    if (filenameComponent.substring(0, 3) != 'run') {
      components.sessionLevelComponentList.push(filenameComponent)
      if (filenameComponent.substring(0, 3) == 'ses') {
        components.ses = filenameComponent
      } else {
        components.subjectLevelComponentList.push(filenameComponent)
        if (filenameComponent.substring(0, 3) == 'sub') {
          components.sub = filenameComponent
        } else {
          components.topLevelComponentList.push(filenameComponent)
        }
      }
    }
  })
  return components
}

function addPotentialPaths(componentList, potentialPaths, offset, prefix) {
  for (var i = componentList.length; i > offset; i--) {
    var tmpList = componentList
      .slice(0, i - 1)
      .concat([componentList[componentList.length - 1]])
    var sessionLevelPath = prefix + tmpList.join('_')
    potentialPaths.push(sessionLevelPath)
  }
}

module.exports = potentialLocations
