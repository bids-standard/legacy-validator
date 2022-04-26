import { assert, assertEquals, assertObjectMatch } from '../deps/asserts.ts'
import { loadSchema } from '../setup/loadSchema.ts'
import { evalCheck } from './applyRules.ts'

const ruleContextData = [
  {
    path: ['rules', 'checks', 'dwi', 'DWIVolumeCount'],
    context: {
      suffix: 'dwi',
      associations: {
        bvec: {
          n_cols: 4
        },
        bval: {
          n_cols: 4
        },
      },
      nifti_header: {
        dim: [0, 0, 0, 0, 4]
      }
    }
  }
]

const schemaDefs = {
  rules: {
    checks: {
      dwi: {
        DWIVolumeCount: {
          code: "VOLUME_COUNT_MISMATCH",
          description: "The number of volumes in this scan does not match the number of volumes in the\ncorresponding .bvec a...",
          level: "error",
          selectors: [ 'suffix == "dwi"', '"bval" in associations', '"bvec" in associations' ],
          checks: [
            "associations.bval.n_cols == nifti_header.dim[4]",
            "associations.bvec.n_cols == nifti_header.dim[4]"
          ]
        }
      }
    }
  }
}

Deno.test("evalCheck test", async(t) => {
  ruleContextData.map(rcd => {
    const rule = rcd.path.reduce((obj, key) => obj[key], schemaDefs)
    rule.selectors.map(selector => {
      assert(evalCheck(selector, rcd.context), `${selector}, ${rcd.context}`)
    })
    rule.checks.map(check => {
      assert(evalCheck(check, rcd.context), `${check}, ${rcd.context}`)
    })
  })
})
