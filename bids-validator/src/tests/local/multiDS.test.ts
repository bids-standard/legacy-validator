import { assert } from '../../deps/asserts.ts'
import { nonSchemaIssues } from '../../issues/list.ts'
import { loadSchema } from '../../setup/loadSchema.ts'
import { validatePath } from './common.ts'

const pathPrefix = 'tests/data/'

/*
 * Object whose keys are dataset names in our test data and values are lists of error codes that should or shouldn't be present after validation of that dataset
 */
const toTest: Record<string, { present: string[]; notPresent: string[] }> = {
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

type Obj = { [key: string]: Obj }

function findKey(obj: Obj, target: string, found: Set<string>) {
  if (typeof obj !== 'object') {
    return
  }
  for (const key in obj) {
    if (key === target && typeof obj[key] === 'string') {
      found.add(obj[key] as unknown as string)
    } else {
      if (key in obj && typeof obj[key] !== 'object') {
        continue
      } else if (key in obj) {
        findKey(obj[key], target, found)
      }
    }
  }
}

Deno.test('All error codes present in schema or list', async (t) => {
  const schema = await loadSchema()
  const allCodes: Set<string> = new Set()
  for (const key in nonSchemaIssues) {
    allCodes.add(key)
  }
  findKey(schema.rules as unknown as Obj, 'code', allCodes)
  console.log(allCodes)

  for (const key in toTest) {
    const notFound = [...toTest[key].present, ...toTest[key].notPresent].filter(
      (x) => !allCodes.has(x),
    )
    assert(
      notFound.length === 0,
      `Test case for ${key} included codes that do not exist in schema or issue list: ${notFound.join(
        ', ',
      )}`,
    )
  }
})
