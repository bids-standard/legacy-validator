import { schemaRegex } from '../../validators/schemaTypes.js'
import type, { schemaSetup } from '../type.js'

describe('type.js', () => {
  describe('isBids()', () => {
    it('does not throw an error for valid defacemask filenames', () => {
      expect(
        type.isBIDS(
          '/sub-rid000043/anat/sub-rid000043_run-02_mod-T1w_defacemask.nii.gz',
        ),
      ).toBe(true)
    })

    it('does not throw an error for recording entity in physio data', () => {
      expect(
        type.isBIDS(
          '/sub-05/eeg/sub-05_task-matchingpennies_recording-eyetracking_physio.tsv.gz',
        ),
      ).toBe(true)
    })

    it('does not throw an error for recording entity in physio data at root of the dataset', () => {
      expect(
        type.isBIDS('/task-matchingpennies_recording-eyetracking_physio.json'),
      ).toBe(true)
    })

    const physio_task_modalities = ['eeg', 'ieeg', 'meg', 'func', 'beh']
    physio_task_modalities.map(mod => {
      it(`does not throw an error for recording entity in ${mod} physio data`, () => {
        expect(
          type.isBIDS(
            `/sub-05/${mod}/sub-05_task-matchingpennies_recording-eyetracking_physio.tsv.gz`,
          ),
        ).toBe(true)
      })
    })
  })
  describe('schema mode tests', () => {
    beforeAll(async () => {
      const schema = await schemaRegex('v1.6.0', { local: true })
      schemaSetup(schema)
    })
    afterAll(() => {
      schemaSetup()
    })
    describe('isAnat()', () => {
      it('does not throw an error when matching basic anat data files', () => {
        expect(type.file.isAnat('/sub-01/anat/sub-01_T1w.nii.gz')).toBe(true)
      })
    })
    describe('isBIDS()', () => {
      it('does not throw an error for valid defacemask filenames', () => {
        expect(
          type.isBIDS(
            '/sub-rid000043/anat/sub-rid000043_run-02_mod-T1w_defacemask.nii.gz',
          ),
        ).toBe(true)
      })
      it('allows a func example', () => {
        expect(
          type.isBIDS('/sub-10159/func/sub-10159_task-bart_bold.nii.gz'),
        ).toBe(true)
        expect(type.isBIDS('/sub-10159/sub-10159_bold_task-bart.nii.gz')).toBe(
          false,
        )
      })
      it('allows an eeg example', () => {
        expect(
          type.isBIDS(
            '/sub-014/ses-t1/eeg/sub-014_ses-t1_task-resteyesc_eeg.edf',
          ),
        ).toBe(true)
      })
      it('allows an ieeg example', () => {
        expect(
          type.isBIDS(
            '/sub-31/ses-iemu/ieeg/sub-31_ses-iemu_task-film_acq-clinical_run-1_ieeg.eeg',
          ),
        ).toBe(true)
      })
      it('allows an meg example', () => {
        expect(
          type.isBIDS(
            '/sub-015/ses-01/meg/sub-015_ses-01_task-AversiveLearningReplay_run-02_meg.fif',
          ),
        ).toBe(true)
        expect(
          type.isBIDS(
            '/sub-015/ses-01/meg/sub-015_ses-01_run-02_task-AversiveLearningReplay_meg.fif',
          ),
        ).toBe(false)
      })
      it('allows expected top level files', () => {
        expect(type.isBIDS('/README')).toBe(true)
        expect(type.isBIDS('/dataset_description.json')).toBe(true)
        expect(type.isBIDS('/not-bids.json')).toBe(false)
      })
      it('does not throw an error for recording entity in physio data at root of the dataset', () => {
        expect(
          type.isBIDS(
            '/task-matchingpennies_recording-eyetracking_physio.json',
          ),
        ).toBe(true)
      })
      it('allows an directiories within datatypes', () => {
        expect(
          type.isBIDS(
            '/sub-0001/meg/sub-0001_task-AEF_run-01_meg.ds/sub-0001_task-AEF_run-01_meg.acq',
          ),
        ).toBe(true)
        expect(
          type.isBIDS(
            '/sub-0001/meg/sub-0001_task-AEF_run-01_meg.ds/BadChannels',
          ),
        ).toBe(true)
      })
    })
  })
})
