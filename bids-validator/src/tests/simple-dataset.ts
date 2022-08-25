import { FileTree } from '../types/filetree.ts'

const text = () => Promise.resolve('')

// Very basic dataset modeled for tests
const rootFileTree = new FileTree('/', '')
const subjectFileTree = new FileTree('/sub-01', 'sub-01', rootFileTree)
const anatFileTree = new FileTree('/sub-01/anat', 'anat', subjectFileTree)
anatFileTree.files = [
  {
    text,
    path: '/sub-01/anat/sub-01_T1w.nii.gz',
    name: 'sub-01_T1w.nii.gz',
    size: 311112,
    ignored: false,
    stream: new ReadableStream<Uint8Array>(),
  },
]
subjectFileTree.files = []
subjectFileTree.directories = [anatFileTree]
rootFileTree.files = [
  {
    text,
    path: '/dataset_description.json',
    name: 'dataset_description.json',
    size: 240,
    ignored: false,
    stream: new ReadableStream(),
  },
  {
    text,
    path: '/README',
    name: 'README',
    size: 709,
    ignored: false,
    stream: new ReadableStream(),
  },
  {
    text,
    path: '/CHANGES',
    name: 'CHANGES',
    size: 39,
    ignored: false,
    stream: new ReadableStream(),
  },
  {
    text,
    path: '/participants.tsv',
    name: 'participants.tsv',
    size: 36,
    ignored: false,
    stream: new ReadableStream(),
  },
]
rootFileTree.directories = [subjectFileTree]

export const simpleDataset = rootFileTree

export const simpleDatasetFileCount = 5
