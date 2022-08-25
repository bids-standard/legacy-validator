const potentialLocations = (path) => {
  //add a '/' at the beginning of the path if it doesn't exist yet
  path = path.startsWith('/') ? path : '/' + path
  const splitPath = path.split('/')
  const filename = splitPath[splitPath.length - 1] // filename path component
  const pathComponents = splitPath.splice(0, splitPath.length - 1) // all path components before

  // split the filename into separate components
  const filenameComponents = filename.split('_')

  // create components object consisting of path + filename component lists
  const components = {
    path: pathComponents,
    filename: filenameComponents,
  }

  // generate relevant paths and put into closest -> root order
  const potentials = potentialPaths(components)
  if (potentials.indexOf(path) < 0) {
    return [path].concat(potentials).reverse()
  } else {
    return potentials
  }
}

const potentialPaths = (components) => {
  let filenameComponents = components.filename // get the underscore separated file components
  let pathComponents = components.path // get the path components before file
  const fileIndex = filenameComponents.length - 1 // index of the filename in file components
  const file = filenameComponents[fileIndex] // filename (events.tsv, bold.json, etc)
  const informationalFileComponents = filenameComponents.slice(0, fileIndex) // all non-filename file path components (ses-*, sub-*, task-*, etc)

  // filter filename components that are allowed only in a lower directory
  // eg if we are root level we will not want sub-* included in the possible
  // paths for this level. Also we do not want to include run in that list.
  const nonPathSpecificFileComponents = informationalFileComponents.filter(
    (component) => pathComponents.indexOf(component) < 0,
  )

  // loop through all the directory levels - root, sub, (ses), (datatype)
  let paths = []
  pathComponents.map((component, i) => {
    const activeDirectoryComponents = pathComponents.slice(0, i + 1) // the directory components in the current working level
    const directoryString = activeDirectoryComponents.join('/') // path of active directory

    const prefixComponents = informationalFileComponents.filter(
      (component) => activeDirectoryComponents.indexOf(component) > -1,
    )

    const prefix = prefixComponents.join('_')
    for (
      let j = 0;
      j < Math.pow(2, nonPathSpecificFileComponents.length);
      j++
    ) {
      const filename = nonPathSpecificFileComponents
        .filter((value, index) => j & (1 << index))
        .concat([file])
        .join('_')

      // join directory + filepath strings together to get entire path
      paths.push(constructFileName(directoryString, filename, prefix))
    }
  })

  // There is an exception to the inheritance principle when it comes
  // to bold data .json sidecars - the potential locations *must* include
  // the task-<taskname> keyword.
  if (filenameComponents.indexOf('bold.json') > -1) {
    paths = removePathsWithoutTasknames(paths)
  }

  return paths
}

const constructFileName = (directoryString, filename, prefix) => {
  // join the prefix + filename if prefix exists
  const filePathString = prefix ? [prefix, filename].join('_') : filename
  const newPath = directoryString + '/' + filePathString
  return newPath
}

const removePathsWithoutTasknames = (paths) => {
  return paths.filter((path) => {
    return path.indexOf('task') > -1
  })
}

export default potentialLocations
