import type from '../type'

const collectSubjects = (fileList) => {
  const subjects = []
  const fileKeys = Object.keys(fileList)
  fileKeys.forEach((key) => {
    const file = fileList[key]
    if (
      !type.file.isStimuliData(file.relativePath) &&
      type.isBIDS(file.relativePath)
    ) {
      const pathValues = type.getPathValues(file.relativePath)
      const isEmptyRoom = pathValues.sub && pathValues.sub == 'emptyroom'

      if (
        pathValues.sub &&
        subjects.indexOf(pathValues.sub) === -1 &&
        !isEmptyRoom
      ) {
        subjects.push(pathValues.sub)
      }
    }
  })
  return subjects
}

export default collectSubjects
