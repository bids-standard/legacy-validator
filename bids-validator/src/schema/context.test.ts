import { assert } from '../deps/asserts.ts'
import { DatasetIssues } from '../issues/datasetIssues.ts'
import { FileTree } from '../types/filetree.ts'
import { BIDSContext } from './context.ts'
import { nullReadBytes } from '../tests/nullReadBytes.ts'

const issues = new DatasetIssues()

const text = () => Promise.resolve('')

const anatJson = () =>
  Promise.resolve(
    JSON.stringify({
      rootOverwrite: 'anat',
      subOverwrite: 'anat',
      anatValue: 'anat',
    }),
  )
const subjectJson = () =>
  Promise.resolve(
    JSON.stringify({ subOverwrite: 'subject', subValue: 'subject' }),
  )
const rootJson = () =>
  Promise.resolve(JSON.stringify({ rootOverwrite: 'root', rootValue: 'root' }))

const rootFileTree = new FileTree('/', '')
const subjectFileTree = new FileTree('/sub-01', 'sub-01', rootFileTree)
const sessionFileTree = new FileTree(
  '/sub-01/ses-01',
  'ses-01',
  subjectFileTree,
)
const anatFileTree = new FileTree(
  '/sub-01/ses-01/anat',
  'anat',
  sessionFileTree,
)

const dataFile = {
  text,
  path: '/sub-01/ses-01/anat/sub-01_ses-01_T1w.nii.gz',
  name: 'sub-01_ses-01_T1w.nii.gz',
  size: 311112,
  ignored: false,
  stream: new ReadableStream<Uint8Array>(),
  readBytes: nullReadBytes,
}

anatFileTree.files = [
  dataFile,
  {
    text: anatJson,
    path: '/sub-01/ses-01/anat/sub-01_ses-01_T1w.json',
    name: 'sub-01_ses-01_T1w.json',
    size: 311112,
    ignored: false,
    stream: new ReadableStream<Uint8Array>(),
    readBytes: nullReadBytes,
  },
]

sessionFileTree.files = []
sessionFileTree.directories = [anatFileTree]

subjectFileTree.files = [
  {
    text: subjectJson,
    path: '/sub-01/ses-01_T1w.json',
    name: 'ses-01_T1w.json',
    size: 311112,
    ignored: false,
    stream: new ReadableStream<Uint8Array>(),
    readBytes: nullReadBytes,
  },
]
subjectFileTree.directories = [sessionFileTree]

rootFileTree.files = [
  {
    text: rootJson,
    path: '/T1w.json',
    name: 'T1w.json',
    size: 311112,
    ignored: false,
    stream: new ReadableStream<Uint8Array>(),
    readBytes: nullReadBytes,
  },
]
rootFileTree.directories = [subjectFileTree]

let context = new BIDSContext(anatFileTree, dataFile, issues)

Deno.test('test context LoadSidecar', async (t) => {
  await context.loadSidecar(rootFileTree)
  await t.step('sidecar overwrites correct fields', () => {
    const { rootOverwrite, subOverwrite } = context.sidecar
    assert(rootOverwrite, 'anat')
    assert(subOverwrite, 'anat')
  })
  await t.step('sidecar adds new fields at each level', () => {
    const { rootValue, subValue, anatValue } = context.sidecar
    assert(rootValue, 'root')
    assert(subValue, 'subject')
    assert(anatValue, 'anat')
  })
})

context = new BIDSContext(rootFileTree, dataFile, issues)

Deno.test('test context loadSubjects', async (t) => {
  await context.loadSubjects()
  await t.step('context produces correct subjects object', () => {
    assert(context.dataset.subjects, "subjects object exists")
    assert(context.dataset.subjects.sub_dirs.length == 1, "there is only one sub dir found")
    assert(context.dataset.subjects.sub_dirs[0] == 'sub-01', "that sub dir is sub-01")
    // no participants.tsv so this should be empty
    assert(context.dataset.subjects.participant_id == undefined, "no participant_id is populated")
  })
})
