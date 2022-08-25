import { ContextAssociations } from '../types/context.ts'
import { BIDSFile } from '../types/file.ts'
import { FileTree } from '../types/filetree.ts'
import { BIDSContext } from './context.ts'
import { readEntities } from './entities.ts'

// type AssociationsLookup = Record<keyof ContextAssociations, { extensions: string[], inherit: boolean, load: ... }

/**
 * This object describes associated files for data files in a bids dataset
 * For any given datafile we iterate over every key/value in this object.
 * For each entry we see if any files in the datafiles directory have:
 *   - a suffix that matches the key
 *   - an extension in the entry's extension array.
 *   - that all the files entities and their values match those of the datafile
 * If the entry allows for inheritance we recurse up the filetree looking for other applicable files.
 * The load functions are incomplete, some associations need to read data from a file so they're
 * returning promises for now.
 */
const associationLookup = {
  events: {
    extensions: ['.tsv'],
    inherit: true,
    load: (file: BIDSFile): Promise<ContextAssociations['events']> => {
      return Promise.resolve({ path: file.path, onset: [] })
    },
  },
  aslcontext: {
    extensions: ['.tsv'],
    inherit: true,
    load: (file: BIDSFile): Promise<ContextAssociations['aslcontext']> => {
      return Promise.resolve({ path: file.path, n_rows: 0, volume_type: [] })
    },
  },
  m0scan: {
    extensions: ['.nii', '.nii.gz'],
    inherit: false,
    load: (file: BIDSFile): Promise<ContextAssociations['m0scan']> => {
      return Promise.resolve({ path: file.path })
    },
  },
  magnitude: {
    extensions: ['.nii', '.nii.gz'],
    inherit: false,
    load: (file: BIDSFile): Promise<ContextAssociations['magnitude']> => {
      return Promise.resolve({ path: file.path, onset: 'silly' })
    },
  },
  magnitude1: {
    extensions: ['.nii', '.nii.gz'],
    inherit: false,
    load: (file: BIDSFile): Promise<ContextAssociations['magnitude1']> => {
      return Promise.resolve({ path: file.path })
    },
  },
  bval: {
    extensions: ['.nii', '.nii.gz'],
    inherit: true,
    load: (file: BIDSFile): Promise<ContextAssociations['bval']> => {
      return Promise.resolve({ path: file.path, n_cols: 0 })
    },
  },
  bvec: {
    extensions: ['.nii', '.nii.gz'],
    inherit: true,
    load: (file: BIDSFile): Promise<ContextAssociations['bvec']> => {
      return Promise.resolve({ path: file.path, n_cols: 0 })
    },
  },
}

export async function buildAssociations(
  fileTree: FileTree,
  source: BIDSContext,
): Promise<ContextAssociations> {
  const associations: ContextAssociations = {}
  for (const key in associationLookup as typeof associationLookup) {
    const { extensions, inherit } =
      associationLookup[key as keyof typeof associationLookup]
    const paths = getPaths(fileTree, source, key, extensions)
    if (paths.length === 0) {
      continue
    }
    if (paths.length > 1) {
      // error?
    }
    // @ts-expect-error
    associations[key] = await associationLookup[key].load(paths[0])
  }
  return Promise.resolve(associations)
}

function getPaths(
  fileTree: FileTree,
  source: BIDSContext,
  targetSuffix: string,
  targetExtensions: string[],
) {
  const validAssociations = fileTree.files.filter((file) => {
    const { suffix, extension, entities } = readEntities(file)
    return (
      targetExtensions.includes(extension) &&
      suffix === targetSuffix &&
      Object.keys(entities).every((entity) => {
        return (
          entity in source.entities &&
          entities[entity] === source.entities[entity]
        )
      })
    )
  })

  const nextDir = fileTree.directories.find((directory) => {
    return source.file.path.startsWith(directory.path)
  })

  if (nextDir) {
    validAssociations.push(
      ...getPaths(nextDir, source, targetSuffix, targetExtensions),
    )
  }
  return validAssociations
}
