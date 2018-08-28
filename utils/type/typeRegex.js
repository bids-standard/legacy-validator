const anatSuffixes = require('./anatSuffixes')

module.exports = {
  funcTopRe: new RegExp(
    '^\\/(?:ses-[a-zA-Z0-9]+_)?(?:recording-[a-zA-Z0-9]+_)?(?:task-[a-zA-Z0-9]+_)?(?:acq-[a-zA-Z0-9]+_)?(?:rec-[a-zA-Z0-9]+_)?(?:run-[0-9]+_)?(?:echo-[0-9]+_)?' +
      '(bold.json|sbref.json|events.json|events.tsv|physio.json|stim.json|beh.json)$',
  ),
  anatTopRe: new RegExp(
    '^\\/(?:ses-[a-zA-Z0-9]+_)?(?:acq-[a-zA-Z0-9]+_)?(?:rec-[a-zA-Z0-9]+_)?(?:run-[0-9]+_)?' +
      '(' +
      anatSuffixes.join('|') +
      ').json$',
  ),
  dwiTopRe: new RegExp(
    '^\\/(?:ses-[a-zA-Z0-9]+_)?(?:acq-[a-zA-Z0-9]+_)?(?:rec-[a-zA-Z0-9]+_)?(?:run-[0-9]+_)?' +
      'dwi.(?:json|bval|bvec)$',
  ),
  multiDirFieldmapRe: new RegExp('^\\/(?:dir-[a-zA-Z0-9]+)_epi.json$'),

  megTopRe: new RegExp(
    '^\\/(?:ses-[a-zA-Z0-9]+_)?task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_proc-[a-zA-Z0-9]+)?' +
      '(_meg.json|_channels.tsv|_photo.jpg|_coordsystem.json)$',
  ),
  ieegTopRe: new RegExp(
    '^\\/(?:ses-[a-zA-Z0-9]+_)?task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_proc-[a-zA-Z0-9]+)?' +
      '(_ieeg.json|_channels.tsv|_electrodes.tsv|_photo.jpg|_coordsystem.json)$',
  ),
  eegTopRe: new RegExp(
    '^\\/(?:ses-[a-zA-Z0-9]+_)?task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_proc-[a-zA-Z0-9]+)?' +
      '(_eeg.json|_channels.tsv|_photo.jpg|_coordsystem.json)$',
  ),
  otherTopFiles: new RegExp(
    '^\\/(?:ses-[a-zA-Z0-9]+_)?(?:recording-[a-zA-Z0-9]+_)?(?:task-[a-zA-Z0-9]+_)?(?:acq-[a-zA-Z0-9]+_)?(?:rec-[a-zA-Z0-9]+_)?(?:run-[0-9]+_)?' +
      '(physio.json|stim.json)$',
  ),
  associatedData: new RegExp(
    '^\\/(?:code|derivatives|sourcedata|stimuli|[.]git)\\/(?:.*)$',
  ),
  stimuliDataRe: new RegExp('^\\/(?:stimuli)\\/(?:.*)$'),
  phenotypicData: new RegExp('^\\/(?:phenotype)\\/(?:.*.tsv|.*.json)$'),
  scansRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?\\1(_\\2)?(_scans.tsv|_scans.json)$',
  ),
  funcSesRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_echo-[0-9]+)?' +
      '(_bold.json|_sbref.json|_events.json|_events.tsv|_physio.json|_stim.json)$',
  ),
  anatSesRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+_)?' +
      '(' +
      anatSuffixes.join('|') +
      ').json$',
  ),
  dwiSesRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_)?' +
      'dwi.(?:json|bval|bvec)$',
  ),
  megSesRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?\\1(_\\2)?(?:_task-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_proc-[a-zA-Z0-9]+)?' +
      '(_events.tsv|_channels.tsv|_meg.json|_coordsystem.json|_photo.jpg|_headshape.pos)$',
  ),
  eegSesRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?\\1(_\\2)?(?:_task-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_proc-[a-zA-Z0-9]+)?' +
      '(_events.tsv|_channels.tsv|_eeg.json|_coordsystem.json|_photo.jpg)$',
  ),
  ieegSesRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?\\1(_\\2)?(?:_task-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_proc-[a-zA-Z0-9]+)?(?:_space-[a-zA-Z0-9]+)?' +
      '(_events.tsv|_channels.tsv|_electrodes.tsv|_ieeg.json|_coordsystem.json|_photo.jpg|_headshape.pos)$',
  ),
  sessionsRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' + '\\/\\1(_sessions.tsv|_sessions.json)$',
  ),
  anatRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?anat' +
      '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?_(?:' +
      anatSuffixes.join('|') +
      ').(nii.gz|nii|json)$',
  ),
  anatDefacemaskRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?anat' +
      '\\/\\1(_\\2)?(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_mod-(' +
      anatSuffixes.join('|') +
      '))?_defacemask.(nii.gz|nii)$',
  ),
  funcRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?func' +
      '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_echo-[0-9]+)?' +
      '(?:_bold.nii.gz|_bold.nii|_bold.json|_sbref.nii.gz|_sbref.nii|_sbref.json|_events.json|_events.tsv|_physio.tsv.gz|_stim.tsv.gz|_physio.json|_stim.json|_defacemask.nii.gz|_defacemask.nii)$',
  ),
  MegRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?meg' +
      '\\/\\1(_\\2)?(?:_task-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_proc-[a-zA-Z0-9]+)?(?:_part-[0-9]+)?' +
      '(_meg(.fif|.fif.gz|.ds\\/.*|\\/.*)|(_events.tsv|_channels.tsv|_meg.json|_coordsystem.json|_photo.jpg|_headshape.pos))$',
  ),
  EegRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?eeg' +
      '\\/\\1(_\\2)?(?:_task-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_proc-[a-zA-Z0-9]+)?(?:_part-[0-9]+)?' +
      '(_eeg.(vhdr|vmrk|eeg|edf|bdf|set|fdt|cnt)|(_events.tsv|_electrodes.tsv|_channels.tsv|_eeg.json|_coordsystem.json|_photo.jpg))$',
  ),
  IEEGRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?ieeg' +
      '\\/\\1(_\\2)?(?:_task-[a-zA-Z0-9]+)?(?:_acq-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_proc-[a-zA-Z0-9]+)?(?:_part-[0-9]+)?(?:_space-[a-zA-Z0-9]+)?' +
      '(_ieeg.(edf|vhdr|vmrk|dat)|(_events.tsv|_channels.tsv|_electrodes.tsv|_ieeg.json|_coordsystem.json|_photo.jpg))$',
  ),
  funcBehRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?beh' +
      '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?' +
      '(?:_beh.json|_beh.tsv|_events.json|_events.tsv|_physio.tsv.gz|_stim.tsv.gz|_physio.json|_stim.json)$',
  ),
  funcBoldRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?func' +
      '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?(?:_echo-[0-9]+)?' +
      '(?:_bold.nii.gz|_bold.nii|_sbref.nii.gz|_sbref.nii)$',
  ),
  contRe: new RegExp(
    '^\\/(sub-[a-zA-Z0-9]+)' +
      '\\/(?:(ses-[a-zA-Z0-9]+)' +
      '\\/)?(?:func|beh)' +
      '\\/\\1(_\\2)?_task-[a-zA-Z0-9]+(?:_acq-[a-zA-Z0-9]+)?(?:_rec-[a-zA-Z0-9]+)?(?:_run-[0-9]+)?' +
      '(?:_recording-[a-zA-Z0-9]+)?' +
      '(?:_physio.tsv.gz|_stim.tsv.gz|_physio.json|_stim.json)$',
  ),
}
