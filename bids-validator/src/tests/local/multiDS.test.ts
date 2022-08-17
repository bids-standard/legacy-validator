import { assert } from '../../deps/asserts.ts'
import { validatePath } from './common.ts'

const pathPrefix = 'tests/data/'

const toTest = {
  valid_filenames: {
    present: [
      'DUPLICATE_NIFTI_FILES',
      'TASK_NAME_CONTAIN_ILLEGAL_CHARACTER',
      'SUBJECT_LABEL_IN_FILENAME_DOESNOT_MATCH_DIRECTORY',
    ],
    notPresent: ['INVALID_JSON_ENCODING'],
  },
  no_t1w: { present: ['NO_T1W'], notPresent: [] },
  no_valid_data: {
    present: ['NO_VALID_DATA_FOUND_FOR_SUBJECT'],
    notPresent: [],
  },
  phasediff_without_magnitude: {
    present: ['MISSING_MAGNITUDE1_FILE'],
    notPresent: [],
  },
  fieldmap_without_magnitude: {
    present: ['FIELDMAP_WITHOUT_MAGNITUDE_FILE'],
    notPresent: [],
  },
  broken_pet_example_2: {
    present: ['JSON_SCHEMA_VALIDATION_ERROR'],
    notPresent: [],
  },
  pet_blood_missing_tsv_column: {
    present: ['TSV_MISSING_REQUIRED_COLUMN'],
    notPresent: [],
  },
  unused_data_dict: { present: [], notPresent: ['SIDECAR_WITHOUT_DATAFILE'] },
}

for (const [dataset, tests] of Object.entries(toTest)) {
  await Deno.test(dataset, async (t) => {
    const { tree, result } = await validatePath(t, `${pathPrefix}${dataset}`)
    tests.present.map((code) => {
      assert(
        result.issues.get(code) !== undefined,
        `code ${code} is not present for test dataset ${dataset} when it should be`,
      )
    })
    tests.notPresent.map((code) => {
      assert(
        result.issues.get(code) === undefined,
        `code ${code} is present for test dataset ${dataset} when it shouldn't be`,
      )
    })
  })
}
