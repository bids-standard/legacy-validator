/**
 * Gets the Target, Scanner Mfg, Radiotracer, and Radionuclide from json sidecar
 * @param {*} fileList
 */
const collectPetFields = (jsonContentsDict) => {
  const fields = {
    BodyPart: {},
    ScannerManufacturer: {},
    ScannerManufacturersModelName: {},
    TracerName: {},
    TracerRadionuclide: {},
  }

  // tally up values in fields from all pet.json files
  Object.entries(jsonContentsDict).forEach(([filepath, json]) => {
    if (filepath.endsWith('pet.json')) {
      record(fields, 'ScannerManufacturer', json.Manufacturer)
      record(
        fields,
        'ScannerManufacturersModelName',
        json.ManufacturersModelName,
      )
      record(fields, 'TracerName', json.TracerName)
      record(fields, 'TracerRadionuclide', json.TracerRadionuclide)
      if (json.BodyPart) record(fields, 'BodyPart', json.BodyPart)
    }
  })

  return ordered(fields)
}

const record = (fields, field, value) => {
  if (fields[field][value]) {
    fields[field][value]++
  } else {
    fields[field][value] = 1
  }
}

/**
 * Takes each field of tallies and converts it to an ordered list (pure).
 */
const ordered = (fields) => {
  const orderedFields = {}
  Object.keys(fields).forEach((key) => {
    orderedFields[key] = orderedList(fields[key])
  })
  return orderedFields
}

/**
 * Given tallies = { a: 3, b: 5, c: 1 }, returns ['b', 'a', 'c']
 * @param {object} tallies
 * @returns {string[]}
 */
export const orderedList = (tallies) =>
  Object.keys(tallies)
    // convert object to list of key/value pairs
    .map((key) => ({ key, count: tallies[key] }))
    // sort by count, greatest to least
    .sort(({ count: a }, { count: b }) => b - a)
    .map(({ key }) => key)

export default collectPetFields
