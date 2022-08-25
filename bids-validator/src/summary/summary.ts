import { collectSubjectMetadata } from './collectSubjectMetadata.ts'
import { readAll, readerFromStreamReader } from '../deps/stream.ts'
import { SummaryOutput, SubjectMetadata } from '../types/validation-result.ts'
import { BIDSContext } from '../schema/context.ts'

export const modalityPrettyLookup: Record<string, string> = {
  mri: 'MRI',
  pet: 'PET',
  meg: 'MEG',
  eeg: 'EEG',
  ieeg: 'iEEG',
  micro: 'Microscopy',
}

const secondaryLookup: Record<string, string> = {
  dwi: 'MRI_Diffusion',
  anat: 'MRI_Structural',
  func: 'MRI_Functional',
  perf: 'MRI_Perfusion',
}

export function computeModalities(
  modalities: Record<string, number>,
): string[] {
  // Order by matching file count
  const nonZero = Object.keys(modalities).filter((a) => modalities[a] !== 0)
  if (nonZero.length === 0) {
    return []
  }
  const sortedModalities = nonZero.sort((a, b) => {
    if (modalities[b] === modalities[a]) {
      // On a tie, hand it to the non-MRI modality
      if (b === 'mri') {
        return -1
      } else {
        return 0
      }
    }
    return modalities[b] - modalities[a]
  })
  return sortedModalities.map((mod) =>
    mod in modalityPrettyLookup ? modalityPrettyLookup[mod] : mod,
  )
}

export function computeSecondaryModalities(
  secondary: Record<string, number>,
): string[] {
  const nonZeroSecondary = Object.keys(secondary).filter(
    (a) => secondary[a] !== 0,
  )
  const sortedSecondary = nonZeroSecondary.sort(
    (a, b) => secondary[b] - secondary[a],
  )
  return sortedSecondary
}

export class Summary {
  sessions: Set<string>
  subjects: Set<string>
  subjectMetadata: SubjectMetadata[]
  tasks: Set<string>
  totalFiles: number
  size: number
  dataProcessed: boolean
  pet: Record<string, any>
  modalitiesCount: Record<string, number>
  secondaryModalitiesCount: Record<string, number>
  datatypes: Set<string>
  constructor() {
    this.dataProcessed = false
    this.totalFiles = -1
    this.size = 0
    this.sessions = new Set()
    this.subjects = new Set()
    this.subjectMetadata = []
    this.tasks = new Set()
    this.pet = {}
    this.datatypes = new Set()
    this.modalitiesCount = {
      mri: 0,
      pet: 0,
      meg: 0,
      eeg: 0,
      ieeg: 0,
      microscopy: 0,
    }
    this.secondaryModalitiesCount = {
      MRI_Diffusion: 0,
      MRI_Structural: 0,
      MRI_Functional: 0,
      MRI_Perfusion: 0,
      PET_Static: 0,
      PET_Dynamic: 0,
      iEEG_ECoG: 0,
      iEEG_SEEG: 0,
    }
  }
  get modalities() {
    return computeModalities(this.modalitiesCount)
  }
  get secondaryModalities() {
    return computeSecondaryModalities(this.secondaryModalitiesCount)
  }
  async update(context: BIDSContext): Promise<void> {
    if (context.file.path.startsWith('/derivatives')) {
      return
    }

    this.totalFiles++
    this.size += await context.file.size

    if ('sub' in context.entities) {
      this.subjects.add(context.entities.sub)
    }
    if ('ses' in context.entities) {
      this.sessions.add(context.entities.ses)
    }

    if (context.datatype.length) {
      this.datatypes.add(context.datatype)
    }

    if (context.extension === '.json') {
      const parsedJson = await context.json
      if ('TaskName' in parsedJson) {
        this.tasks.add(parsedJson.TaskName)
      }
    }
    if (context.modality) {
      this.modalitiesCount[context.modality]++
    }

    if (context.datatype in secondaryLookup) {
      const key = secondaryLookup[context.datatype]
      this.secondaryModalitiesCount[key]++
    } else if (context.datatype === 'pet' && 'rec' in context.entities) {
      if (['acstat', 'nacstat'].includes(context.entities.rec)) {
        this.secondaryModalitiesCount.PET_Static++
      } else if (['acdyn', 'nacdyn'].includes(context.entities.rec)) {
        this.secondaryModalitiesCount.PET_Dynamic++
      }
    }

    if (context.file.path.endsWith('participants.tsv')) {
      const tsvContents = await context.file.text()
      this.subjectMetadata = collectSubjectMetadata(tsvContents)
    }
  }

  formatOutput(): SummaryOutput {
    return {
      sessions: Array.from(this.sessions),
      subjects: Array.from(this.subjects),
      subjectMetadata: this.subjectMetadata,
      tasks: Array.from(this.tasks),
      modalities: this.modalities,
      secondaryModalities: this.secondaryModalities,
      totalFiles: this.totalFiles,
      size: this.size,
      dataProcessed: this.dataProcessed,
      pet: this.pet,
      datatypes: Array.from(this.datatypes),
    }
  }
}
