import { BIDSFile } from '../types/file.ts'

export interface BIDSEntities {
  suffix: string
  extension: string
  entities: Record<string, string>
}

export function readEntities(file: BIDSFile): BIDSEntities {
  let suffix = ''
  let extension = ''
  let entities: Record<string, string> = {}

  let parts = file.name.split('_')
  for (let i = 0; i < parts.length - 1; i++) {
    let [entity, label] = parts[i].split('-')
    if (entity && label) {
      entities[entity] = label
    } else {
      entities[entity] = 'NOENTITY'
    }
  }

  const lastPart = parts[parts.length - 1]
  const extStart = lastPart.indexOf('.')
  if (extStart === -1) {
    suffix = lastPart
  } else {
    suffix = lastPart.slice(0, extStart)
    extension = lastPart.slice(extStart)
  }

  return { suffix: suffix, extension: extension, entities: entities }
}
