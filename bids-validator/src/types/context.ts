export interface ContextDatasetSubjects {
  sub_dirs: string[]
  participant_id: string[]
  phenotype: string[]
}
export interface ContextDataset {
  dataset_description: object
  files: any[]
  tree: object
  ignored: any[]
  modalities: any[]
  subjects: ContextDatasetSubjects
}
export interface ContextSubjectSessions {
  ses_dirs: string[]
  session_id: string[]
  phenotype: string[]
}
export interface ContextSubject {
  sessions: ContextSubjectSessions
}
export interface ContextAssociationsEvents {
  path: string
  onset: string[]
}
export interface ContextAssociationsAslcontext {
  path: string
  n_rows: number
  volume_type: string[]
}
export interface ContextAssociationsM0scan {
  path: string
}
export interface ContextAssociationsMagnitude {
  path: string
}
export interface ContextAssociationsMagnitude1 {
  path: string
}
export interface ContextAssociationsBval {
  path: string
  n_cols: number
}
export interface ContextAssociationsBvec {
  path: string
  n_cols: number
}
export interface ContextAssociations {
  events?: ContextAssociationsEvents
  aslcontext?: ContextAssociationsAslcontext
  m0scan?: ContextAssociationsM0scan
  magnitude?: ContextAssociationsMagnitude
  magnitude1?: ContextAssociationsMagnitude1
  bval?: ContextAssociationsBval
  bvec?: ContextAssociationsBvec
}
export interface ContextNiftiHeaderDimInfo {
  freq: number
  phase: number
  slice: number
}
export interface ContextNiftiHeaderXyztUnits {
  xyz: 'unknown' | 'meter' | 'mm' | 'um'
  t: 'unknown' | 'sec' | 'msec' | 'usec'
}
export interface ContextNiftiHeader {
  dim_info: ContextNiftiHeaderDimInfo
  dim: number[]
  pixdim: number[]
  xyzt_units: ContextNiftiHeaderXyztUnits
  qform_code: number
  sform_code: number
}
export interface Context {
  dataset: ContextDataset
  subject: ContextSubject
  path: string
  entities: object
  datatype: string
  suffix: string
  extension: string
  modality: string
  sidecar: object
  associations: ContextAssociations
  columns: object
  json: object
  nifti_header: ContextNiftiHeader
}
