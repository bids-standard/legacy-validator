// @ts-nocheck
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
          n_cols: 4,
        },
        bval: {
          n_cols: 4,
        },
      },
      nifti_header: {
        dim: [0, 0, 0, 0, 4],
      },
    },
  },
]

const schemaDefs = {
  rules: {
    checks: {
      dwi: {
        DWIVolumeCount: {
          code: 'VOLUME_COUNT_MISMATCH',
          description:
            'The number of volumes in this scan does not match the number of volumes in the\ncorresponding .bvec a...',
          level: 'error',
          selectors: [
            'suffix == "dwi"',
            '"bval" in associations',
            '"bvec" in associations',
          ],
          checks: [
            'associations.bval.n_cols == nifti_header.dim[4]',
            'associations.bvec.n_cols == nifti_header.dim[4]',
          ],
        },
      },
    },
  },
}

Deno.test('evalCheck test', () => {
  ruleContextData.map((rcd) => {
    const rule = rcd.path.reduce((obj, key) => obj[key], schemaDefs)
    rule.selectors.map((selector: string) => {
      assert(evalCheck(selector, rcd.context), `${selector}, ${rcd.context}`)
    })
    rule.checks.map((check: string) => {
      assert(evalCheck(check, rcd.context), `${check}, ${rcd.context}`)
    })
  })
})

Deno.test('evalCheck ensure constructor access', () => {
  assert(
    evalCheck('foo.constructor.isArray(foo)', { foo: [1] }),
    'can not access Array prototype via constructor',
  )
})

Deno.test('evalCheck built in apis fail', () => {
  assert(evalCheck('fetch', {}) === undefined, 'fetch in evalCheck namespace')
})
