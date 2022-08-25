const derivativesFilePattern = /^\/derivatives\/\w+re/

export default function checkForDerivatives(files) {
  return (
    Object.values(files).findIndex((file) =>
      derivativesFilePattern.test(file.relativePath),
    ) !== -1
  )
}
