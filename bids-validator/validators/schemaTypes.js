import yaml from 'js-yaml'
import isNode from '../utils/isNode'

// Version implemented by the internal rules or the included schema version
const localVersion = 'v1.6.0'

const modalities = [
  'anat',
  'beh',
  'dwi',
  'eeg',
  'fmap',
  'func',
  'ieeg',
  'meg',
  'pet',
]

async function loadYaml(base, path, local) {
  const url = `${base}/${path}`
  try {
    let text // Loaded raw yaml
    if (local) {
      throw Error('Defaulting to embedded bids-specification schema')
    } else {
      const res = await fetch(url)
      if (res.status !== 200) {
        throw Error(
          `Loading remote bids-specification schema failed, falling back to embedded bids-specification@${localVersion}`,
        )
      }
      text = await res.text()
    }
    return yaml.safeLoad(text)
  } catch (err) {
    if (isNode) {
      const fs = require('fs')
      const text = fs.readFileSync(url, 'utf-8')
      return yaml.safeLoad(text)
    } else {
      // TODO - handle the case where no yaml is available in the browser
      throw Error(
        `Loading remote bids-specification schema failed, and internal validation rules will be used instead`,
      )
    }
  }
}

/**
 * Load schema files from network or embedded copies
 * @param {string} base Base URL or path
 * @param {boolean} local Avoid any network access
 */
async function loadSchema(base, local = false) {
  const top = 'top_level_files.yaml'
  const entities = 'entities.yaml'
  return {
    top_level_files: await loadYaml(base, top, local),
    entities: await loadYaml(base, entities, local),
    datatypes: {
      anat: await loadYaml(base, `datatypes/anat.yaml`, local),
      beh: await loadYaml(base, `datatypes/beh.yaml`, local),
      dwi: await loadYaml(base, `datatypes/dwi.yaml`, local),
      eeg: await loadYaml(base, `datatypes/eeg.yaml`, local),
      fmap: await loadYaml(base, `datatypes/fmap.yaml`, local),
      func: await loadYaml(base, `datatypes/func.yaml`, local),
      ieeg: await loadYaml(base, 'datatypes/ieeg.yaml', local),
      meg: await loadYaml(base, 'datatypes/meg.yaml', local),
      pet: await loadYaml(base, 'datatypes/pet.yaml', local),
    },
  }
}

/**
 * Generate matching regular expressions based on the most recent bids-specification schema
 * @param {*} schema Loaded yaml schemas (js-yaml)
 * @param {boolean} pythonRegex Boolean flag to enable/disable Python compatible regex generation
 * @returns
 */
export async function generateRegex(schema, pythonRegex = false) {
  // Python regex needs a 'P' before matching group name
  const P = pythonRegex ? 'P' : ''
  const regex = {
    label: '[a-zA-Z0-9]+',
    index: '[0-9]+',
    sub_ses_dirs:
      '^[\\/\\\\](sub-[a-zA-Z0-9]+)[\\/\\\\](?:(ses-[a-zA-Z0-9]+)[\\/\\\\])?',
    type_dir: '[\\/\\\\]',
    sub_ses_entity: '\\1(_\\2)?',
    optional: '?',
    required: '',
  }

  const exportRegex = {
    top_level_files: [],
    datatypes: {
      anat: [],
      beh: [],
      dwi: [],
      eeg: [],
      fmap: [],
      func: [],
      ieeg: [],
      meg: [],
      pet: [],
    },
  }

  // Modality agnostic top level files
  for (const root of Object.keys(schema.top_level_files)) {
    const extensions = schema.top_level_files[root].extensions.join('|')
    const root_level = `[\\/\\\\]${root}${
      extensions === 'None' ? '' : `(?${P}<suffix>${extensions})`
    }$`
    exportRegex.top_level_files.push(new RegExp(root_level))
  }

  for (const mod of modalities) {
    const modality_datatype_schema = schema.datatypes[mod]
    for (const datatype of modality_datatype_schema) {
      let file_regex = `${regex.sub_ses_dirs}${mod}${regex.type_dir}${regex.sub_ses_entity}`
      for (const entity of Object.keys(schema.entities)) {
        const entityDefinion = schema.entities[entity]
        if (entity in datatype.entities) {
          // sub and ses entities in file name handled by directory pattern matching groups
          if (entity === 'subject' || entity === 'session') {
            continue
          }
          const entityKey = entityDefinion.entity
          const format = regex[schema.entities[entity].format]
          if (format) {
            // Limitation here is that if format is missing an essential entity may be skipped
            file_regex += `(?${P}<${entity}>_${entityKey}-${format})${
              regex[datatype.entities[entity]]
            }`
          }
        }
      }
      const suffix_regex = `_(?${P}<suffix>${datatype.suffixes.join('|')})`
      // Workaround v1.6.0 MEG extension "*"
      const wildcard_extensions = datatype.extensions.map(ext =>
        ext === '*' ? '.*?' : ext,
      )
      const ext_regex = `(?${P}<ext>${wildcard_extensions.join('|')})`
      exportRegex.datatypes[mod].push(
        new RegExp(file_regex + suffix_regex + ext_regex + '$'),
      )
    }
  }
  return exportRegex
}

export async function schemaRegex(version = localVersion, options = {}) {
  let schema
  if ('local' in options) {
    schema = await loadSchema('./bids-validator/schema', true)
  } else {
    schema = await loadSchema(
      `https://raw.githubusercontent.com/bids-standard/bids-specification/${version}/src/schema`,
    )
  }
  return generateRegex(schema)
}
