import type from '../type.js'

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
    physio_task_modalities.map((mod) => {
      it(`does not throw an error for recording entity in ${mod} physio data`, () => {
        expect(
          type.isBIDS(
            `/sub-05/${mod}/sub-05_task-matchingpennies_recording-eyetracking_physio.tsv.gz`,
          ),
        ).toBe(true)
      })
    })
  })
})
