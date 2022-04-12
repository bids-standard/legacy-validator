import { FileTree } from '../files/filetree.ts'

// Very basic dataset modeled for tests
const rootFileTree = new FileTree('/', '')
const subjectFileTree = new FileTree('/sub-01', 'sub-01', rootFileTree)
const anatFileTree = new FileTree('/sub-01/anat', 'anat', subjectFileTree)
anatFileTree.files = [
  {
    path: '/sub-01/anat/sub-01_T1w.nii.gz',
    name: 'sub-01_T1w.nii.gz',
    size: Promise.resolve(311112),
    ignored: false,
    stream: Promise.resolve(new ReadableStream()),
  },
]
subjectFileTree.files = []
subjectFileTree.directories = [anatFileTree]
rootFileTree.files = [
  {
    path: '/dataset_description.json',
    name: 'dataset_description.json',
    size: Promise.resolve(240),
    ignored: false,
    stream: Promise.resolve(new ReadableStream()),
  },
  {
    path: '/README',
    name: 'README',
    size: Promise.resolve(709),
    ignored: false,
    stream: Promise.resolve(new ReadableStream()),
  },
  {
    path: '/CHANGES',
    name: 'CHANGES',
    size: Promise.resolve(39),
    ignored: false,
    stream: Promise.resolve(new ReadableStream()),
  },
  {
    path: '/participants.tsv',
    name: 'participants.tsv',
    size: Promise.resolve(36),
    ignored: false,
    stream: Promise.resolve(new ReadableStream()),
  },
]
rootFileTree.directories = [subjectFileTree]

export const simpleDataset = rootFileTree

export const simpleDatasetFileCount = 5
