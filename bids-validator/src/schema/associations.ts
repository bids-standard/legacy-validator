import {
  ContextAssociations,
  ContextAssociationsEvents,
} from '../types/context.ts'
import { BIDSFile } from '../types/file.ts'
import { FileTree } from '../types/filetree.ts'
import { BIDSContext } from './context.ts'
import { readEntities } from './entities.ts'
import { parseTSV } from '../files/tsv.ts'
import { parseBvalBvec } from '../files/dwi.ts'

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
    suffix: 'events',
    extensions: ['.tsv'],
    inherit: true,
    load: async (file: BIDSFile): Promise<ContextAssociations['events']> => {
      const text = await file.text()
      const columns = parseTSV(text)
      return {
        path: file.path,
        onset: columns.get('onset') || [],
      }
    },
  },
  aslcontext: {
    suffix: 'aslcontext',
    extensions: ['.tsv'],
    inherit: true,
    load: async (
      file: BIDSFile,
    ): Promise<ContextAssociations['aslcontext']> => {
      const contents = await file.text()
      const columns = parseTSV(contents)
      return {
        path: file.path,
        n_rows: columns.get('volume_type')?.length || 0,
        volume_type: columns.get('volume_type') || [],
      }
    },
  },
  m0scan: {
    suffix: 'm0scan',
    extensions: ['.nii', '.nii.gz'],
    inherit: false,
    load: (file: BIDSFile): Promise<ContextAssociations['m0scan']> => {
      return Promise.resolve({ path: file.path })
    },
  },
  magnitude: {
    suffix: 'magnitude',
    extensions: ['.nii', '.nii.gz'],
    inherit: false,
    load: (file: BIDSFile): Promise<ContextAssociations['magnitude']> => {
      return Promise.resolve({ path: file.path })
    },
  },
  magnitude1: {
    suffix: 'magnitude1',
    extensions: ['.nii', '.nii.gz'],
    inherit: false,
    load: (file: BIDSFile): Promise<ContextAssociations['magnitude1']> => {
      return Promise.resolve({ path: file.path })
    },
  },
  bval: {
    suffix: 'dwi',
    extensions: ['.bval'],
    inherit: true,
    load: async (file: BIDSFile): Promise<ContextAssociations['bval']> => {
      const contents = await file.text()
      const rows = parseBvalBvec(contents)
      return {
        path: file.path,
        n_cols: rows ? rows[0].length : 0,
        n_rows: rows ? rows.length : 0,
        values: rows[0],
      }
    },
  },
  bvec: {
    suffix: 'dwi',
    extensions: ['.bvec'],
    inherit: true,
    load: async (file: BIDSFile): Promise<ContextAssociations['bvec']> => {
      const contents = await file.text()
      const rows = parseBvalBvec(contents)
      return {
        path: file.path,
        n_cols: rows ? rows[0].length : 0,
        n_rows: rows ? rows.length : 0,
      }
    },
  },
  channels: {
    suffix: 'channels',
    extensions: ['.tsv'],
    inherit: true,
    load: async (file: BIDSFile): Promise<ContextAssociations['channels']> => {
      const contents = await file.text()
      const columns = parseTSV(contents)
      return {
        path: file.path,
        type: columns.get('type') || [],
        short_channel: columns.get('short_channel') || [],
      }
    },
  },
  coordsystem: {
    suffix: 'coordsystem',
    extensions: ['.json'],
    inherit: true,
    load: (file: BIDSFile): Promise<ContextAssociations['coordsystem']> => {
      return Promise.resolve({ path: file.path })
    },
  },
}

export async function buildAssociations(
  fileTree: FileTree,
  source: BIDSContext,
): Promise<ContextAssociations> {
  const associations: ContextAssociations = {}
  for (const key in associationLookup as typeof associationLookup) {
    const { suffix, extensions, inherit } =
      associationLookup[key as keyof typeof associationLookup]
    const paths = getPaths(fileTree, source, suffix, extensions)
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
    const { suffix, extension, entities } = readEntities(file.name)
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
