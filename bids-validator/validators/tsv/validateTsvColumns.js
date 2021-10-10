import utils from '../../utils'
const Issue = utils.issues.Issue
import nonCustomColumns from '../../bids_validator/tsv/non_custom_columns.json'

/**
 * @param {Object} file - BIDS file object
 * Accepts file object and returns a type based on file path
 */
export const getTsvType = function(file) {
  let tsvType = 'misc'
  if (file.relativePath.includes('phenotype/')) {
    tsvType = 'phenotype'
  } else if (file.name === 'participants.tsv') {
    tsvType = 'participants'
  } else if (
    file.name.endsWith('_channels.tsv') ||
    file.name.endsWith('_electrodes.tsv') ||
    file.name.endsWith('_events.tsv') ||
    file.name.endsWith('_scans.tsv') ||
    file.name.endsWith('_sessions.tsv') ||
    file.name.endsWith('_aslcontext.tsv') ||
    file.name.endsWith('_blood.tsv')
  ) {
    const split = file.name.split('_')
    tsvType = split[split.length - 1].replace('.tsv', '')
  }
  return tsvType
}

const getHeaders = tsvContents => tsvContents
  .replace(/^\uefff/, '')
  .split('\n')[0]
  .trim()
  .split('\t')

/**
 *
 * @param {array} headers -Array of column names
 * @param {string} type - Type from getTsvType
 * Checks TSV column names to determine if they're core or custom
 * Returns array of custom column names
 */
const getCustomColumns = function(headers, type) {
  const customCols = []
  // Iterate column headers
  for (let col of headers) {
    // If it's a custom column
    if (!nonCustomColumns[type].includes(col)) {
      customCols.push(col)
    }
  }
  return customCols
}
const commaSeparatedStringOf = items => items.map(item => `"${item}"`).join(', ')

/**
 * Loads relevant JSON schema for given tsv modalities.
 * Currently only required for pet_blood.
 * @param {*} tsvs
 * @returns
 */
const loadSchemas = tsvs => {
  const schemas = {}
  const getSchemaByType = {
    'blood': () => require('../json/schemas/pet_blood.json')
  }
  const types = new Set(tsvs.map(tsv => getTsvType(tsv.file)))
  types.forEach(type => {
    if (getSchemaByType.hasOwnProperty(type)) {
      schemas[type] = getSchemaByType[type]()
    }
  })
  return schemas
}

/**
 *
 * @param {array} tsvs - Array of objects containing TSV file objects and contents
 * @param {Object} jsonContentsDict
 */
const validateTsvColumns = function(tsvs, jsonContentsDict, headers) {
  const tsvIssues = []
  const schemas = loadSchemas(tsvs)

  tsvs.map(tsv => {
    const tsvType = getTsvType(tsv.file)
    const customColumns = getCustomColumns(
      getHeaders(tsv.contents),
      tsvType,
    )
    const isPetBlood = tsvType === 'blood'
    if (customColumns.length > 0 || isPetBlood) {
      // Get merged data dictionary for this file
      const potentialSidecars = utils.files.potentialLocations(
        tsv.file.relativePath.replace('.tsv', '.json'),
      )
      const mergedDict = utils.files.generateMergedSidecarDict(
        potentialSidecars,
        jsonContentsDict,
      )
      const keys = Object.keys(mergedDict)
      // Gather undefined columns for the file
      const undefinedCols = customColumns.filter(col => !keys.includes(col))
      // Create an issue for all undefined columns in this file
      undefinedCols.length &&
        tsvIssues.push(
          customColumnIssue(
            tsv.file,
            undefinedCols.join(', '),
            potentialSidecars,
          ),
        )

      if (isPetBlood) {
        // Check PET tsv headers required by json sidecar
        const petBloodHeaderIssues = validatePetBloodHeaders(tsv, mergedDict, schemas['blood'])
        tsvIssues.push(...petBloodHeaderIssues)
      }
    }
  })
  // Return array of all instances of undescribed custom columns

  // Manage custom instances made from asl_context
  const aslTsvIssues = validateASL(tsvs, jsonContentsDict, headers)
  tsvIssues.push(...aslTsvIssues)

  return tsvIssues
}

/**
 * Validates that tsv columns required by
 * @param {*} tsv
 * @param {*} mergedDict
 * @param {*} schema
 * @returns
 */
export const validatePetBloodHeaders = (tsv, mergedDict, schema) => {
  const tsvIssues = []
  const headers = getHeaders(tsv.contents)

  // Collect required headers and the JSON sidecar properties that require them.
  const requiredHeaders = {}
  Object.entries(schema.properties)
    .forEach(([ property, subSchema ]) => {
      if (
        subSchema.hasOwnProperty('requires_tsv_non_custom_columns')
        && mergedDict[property] === true
      ) {
        subSchema.requires_tsv_non_custom_columns.forEach(header => {
          if (header in requiredHeaders) {
            requiredHeaders[header].push(property)
          } else {
            requiredHeaders[header] = [property]
          }
        })
      }
    })
  Object.entries(requiredHeaders).forEach(([requiredHeader, requiredBy]) => {
    if (!headers.includes(requiredHeader)) {
      tsvIssues.push(new Issue({
        code: 211,
        file: tsv.file,
        evidence: `${tsv.file.name} has headers: ${commaSeparatedStringOf(headers)}; missing header "${requiredHeader}", which is required when any of the properties (${commaSeparatedStringOf(requiredBy)}) are true in the associated JSON sidecar.`,
      }))
    }
  })
  return tsvIssues
}

const validateASL = (tsvs, jsonContentsDict, headers) => {
  const tsvIssues = []
  // Manage custom instances from asl_context tsv files
  // get all headers associated with asl_context data
  tsvs.map(tsv => {
    const aslHeaders = headers.filter(header => {
      const file = header[0]
      return file.relativePath.includes('_asl')
    })

    aslHeaders.forEach(aslHeader => {
      // extract the fourth element of 'dim' field of header - this is the
      // number of volumes that were obtained during scan (numVols)
      const file = aslHeader[0]
      const header = aslHeader[1]
      const dim = header.dim
      const numVols = dim[4]

      // get the _asl_context.tsv associated with this asl scan
      const potentialAslContext = utils.files.potentialLocations(
        file.relativePath.replace('.gz', '').replace('asl.nii', 'aslcontext.tsv'),
      )
      const associatedAslContext = potentialAslContext.indexOf(tsv.file.relativePath)


      if (associatedAslContext > -1)
      {
        const rows = tsv.contents
        .replace(/[\r]+/g,'')
        .split('\n')
        .filter(row => !(!row || /^\s*$/.test(row)))

        const m0scan_filters = ['m0scan'];
        const filtered_m0scan_rows = rows.filter(row => m0scan_filters.includes(row))

        const asl_filters = ['cbf','m0scan','label','control','deltam','volume_type'];
        const filtered_tsv_rows = rows.filter(row => asl_filters.includes(row))
        if (rows.length != filtered_tsv_rows.length)
        {
          tsvIssues.push(
            new Issue({
              code: 176,
              file: file,
            })
          )
        }

        if (rows.length -1 != numVols) {
          tsvIssues.push(
            new Issue({
              code: 165,
              file: file,
            })
          )
        }

        // get the json sidecar dictionary associated with that nifti scan
        var potentialSidecars = utils.files.potentialLocations(
          tsv.file.relativePath.replace('aslcontext.tsv', 'asl.json'),
        )

        // get merged data dictionary for this file
        const mergedDict = utils.files.generateMergedSidecarDict(
          potentialSidecars,
          jsonContentsDict,
        )

        // check M0Type and tsv list for m0scan in case of an Included M0Type
        if (mergedDict.hasOwnProperty('M0Type') &&
            mergedDict['M0Type'] === "Included" &&
            filtered_m0scan_rows.length < 1
          )
        {
          tsvIssues.push(
            new Issue({
              file: file,
              code: 154,
              reason:
                "''M0Type' is set to 'Included' however the tsv file does not contain any m0scan volume."
            }),
          )
        }
        // check M0Type and tsv list for m0scan in case of an Absent M0Type
        if (mergedDict.hasOwnProperty('M0Type') &&
            mergedDict['M0Type'] === "Absent" &&
            filtered_m0scan_rows.length >= 1
          )
        {
          tsvIssues.push(
            new Issue({
              file: file,
              code: 199,
              reason:
                "''M0Type' is set to 'Absent' however the tsv file contains an m0scan volume. This should be avoided."
            }),
          )
        }

        // check Flip Angle requirements with LookLocker acquisitions
        if (
            mergedDict.hasOwnProperty('FlipAngle') &&
            mergedDict['FlipAngle'].constructor === Array
          )
        {
          let FlipAngle = mergedDict['FlipAngle']
          const FlipAngleLength = FlipAngle.length
          if (FlipAngleLength !== rows.length -1) {
            tsvIssues.push(
              new Issue({
                file: file,
                code: 172,
                reason:
                  "''FlipAngle' for this file does not match the TSV length. Please make sure that the size of the FlipAngle array in the json corresponds to the number of volume listed in the tsv file."
              }),
            )
          }
        }
        // check Labelling Duration matching with TSV length only for PCASL or CASL
        if
        (
          mergedDict.hasOwnProperty('LabelingDuration') &&
          mergedDict['LabelingDuration'].constructor === Array &&
          mergedDict.hasOwnProperty('ArterialSpinLabelingType') &&
          (mergedDict['ArterialSpinLabelingType'] == 'CASL' || mergedDict['ArterialSpinLabelingType'] == 'PCASL')
        )
        {
          let LabelingDuration = mergedDict['LabelingDuration']
          const LabelingDurationLength = LabelingDuration.length
          if (LabelingDurationLength !== rows.length -1) {
            tsvIssues.push(
              new Issue({
                file: file,
                code: 175,
                reason:
                  "''LabelingDuration' for this file does not match the TSV length. Please be sure that the size of the LabelingDuration array in the json corresponds to the number of volume listed in the tsv file."
              }),
            )
          }
        }

        // check VolumeTiming with TSV length
        if
        (
          mergedDict.hasOwnProperty('RepetitionTimePreparation') &&
          mergedDict['RepetitionTimePreparation'].constructor === Array
        )
        {
          let RepetitionTimePreparation = mergedDict['RepetitionTimePreparation']
          const RepetitionTimePreparationLength = RepetitionTimePreparation.length
          if (RepetitionTimePreparationLength !== rows.length -1) {
            tsvIssues.push(
              new Issue({
                file: file,
                code: 177,
                reason:
                  "''RepetitionTimePreparation' for this file do not match the TSV length. Please be sure that the size of the RepetitionTimePreparation array in the json corresponds to the number of volume listed in the tsv file."
              }),
            )
          }
        }

        // check Post Labelling Delays matching with TSV length
        if (
            mergedDict.hasOwnProperty('PostLabelingDelay') &&
            mergedDict['PostLabelingDelay'].constructor === Array
          )
        {
          let PostLabelingDelay = mergedDict['PostLabelingDelay']
          const PostLabelingDelayLength = PostLabelingDelay.length
          if (PostLabelingDelayLength !== rows.length -1) {
            tsvIssues.push(
              new Issue({
                file: file,
                code: 174,
                reason:
                  "''PostLabelingDelay' for this file do not match the TSV length. Please be sure that the size of the PostLabelingDelay array in the json corresponds to the number of volume listed in the tsv file."
              }),
            )
          }
        }

        if ( mergedDict.hasOwnProperty('TotalAcquiredVolumes') ) {
          let TotalAcquiredVolumes = mergedDict['TotalAcquiredVolumes']
          const TotalAcquiredVolumesLength = TotalAcquiredVolumes.length
          if (TotalAcquiredVolumesLength !== rows.length -1) {
            tsvIssues.push(
              new Issue({
                file: file,
                code: 181,
                reason:
                  "''TotalAcquiredVolumes' for this file do not match the TSV length. Please be sure that the size of the TotalAcquiredVolumes array in the json corresponds to the number of volume listed in the tsv file."
              }),
            )
          }
        }

        if (
             mergedDict.hasOwnProperty('EchoTime') &&
             mergedDict['EchoTime'].constructor === Array
             ) {
          let EchoTime = mergedDict['EchoTime']
          const EchoTimeLength = EchoTime.length
          if (EchoTimeLength !== rows.length -1) {
            tsvIssues.push(
              new Issue({
                file: file,
                code: 196,
                reason:
                  "''EchoTime' for this file do not match the TSV length. Please be sure that the size of the EchoTime array in the json corresponds to the number of volume listed in the tsv file."
              }),
            )
          }
        }
      }
    })
  })
  return tsvIssues
}

const customColumnIssue = function(file, col, locations) {
  return new Issue({
    code: 82,
    file: file,
    evidence:
      'Columns: ' +
      col +
      ' not defined, please define in: ' +
      locations.toString().replace(',', ', '),
  })
}

export default validateTsvColumns
