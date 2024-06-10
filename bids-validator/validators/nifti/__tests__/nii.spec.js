import { checkPetRequiredFields } from '../nii'

describe('nifti checks', () => {
  describe('PET sidecar checks', () => {
    it('returns no issues for a correct file', () => {
      expect(
        checkPetRequiredFields(
          {},
          {
            Manufacturer: 'Siemens',
            ManufacturersModelName:
              'High-Resolution Research Tomograph (HRRT, CTI/Siemens)',
            Units: 'Bq/mL',
            BodyPart: 'Brain',
            TracerName: 'SB',
            TracerRadionuclide: 'C11',
            TracerMolecularWeight: 339.8,
            TracerMolecularWeightUnits: 'g/mol',
            InjectedRadioactivity: 599.444,
            InjectedRadioactivityUnits: 'MBq',
            InjectedMass: 0.938403836472209,
            InjectedMassUnits: 'ug',
            MolarActivity: 217.7,
            MolarActivityUnits: 'GBq/umol',
            SpecificRadioactivity: 640.6709829311359,
            SpecificRadioactivityUnits: 'MBq/ug',
            ModeOfAdministration: 'bolus',
            TimeZero: '13:02:59',
            ScanStart: 0,
            InjectionStart: 0,
            FrameDuration: [
              5, 5, 5, 5, 5, 5, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 30, 30,
              30, 30, 120, 120, 120, 120, 120, 300, 300, 300, 300, 300, 600,
              600, 600, 600, 600, 600, 600, 600,
            ],
            FrameTimesStart: [
              0, 5, 10, 15, 20, 25, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,
              180, 210, 240, 270, 300, 420, 540, 660, 780, 900, 1200, 1500,
              1800, 2100, 2400, 3000, 3600, 4200, 4800, 5400, 6000, 6600,
            ],
            ReconMethodParameterLabels: [
              'iterations',
              'subsets',
              'lower_threshold',
              'upper_threshold',
            ],
            ReconMethodParameterUnits: ['none', 'none', 'keV', 'keV'],
            ReconMethodParameterValues: [10, 16, 0, 650],
            ScaleFactor: [
              7.594985049763636e-7, 8.265859605671722e-7, 1.3820734920955147e-6,
              1.5545690530416323e-6, 1.6220834595515043e-6,
              2.4517744350305293e-6, 8.905253707780503e-7, 6.875428653074778e-7,
              9.91522711046855e-7, 9.279470418732672e-7, 1.223937488248339e-6,
              8.961077924141136e-7, 8.55694622714509e-7, 1.017058366414858e-6,
              8.278300356323598e-7, 1.0040834013125277e-6,
              3.9711613908366417e-7, 6.720089800182905e-7, 5.650269372381445e-7,
              4.739523831176484e-7, 1.3938594634055335e-7,
              1.5224574667627166e-7, 1.8099771637025697e-7,
              1.9275844920230156e-7, 1.8285233238657383e-7,
              1.0964477326069755e-7, 1.431431400078509e-7,
              1.0884801326938032e-7, 1.3908149298913486e-7,
              1.229657300427789e-7, 1.063033252535206e-7, 1.424941302730076e-7,
              1.7276526875775744e-7, 2.49544115149547e-7, 3.827111640930525e-7,
              4.0279633140016813e-7, 5.26599649219861e-7, 8.640701025797171e-7,
            ],
            ScatterFraction: [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
            DecayCorrectionFactor: [
              1.0133966207504272, 1.0162700414657593, 1.0191516876220703,
              1.0220414400100708, 1.0249395370483398, 1.0278457403182983,
              1.0336800813674927, 1.042497992515564, 1.0513912439346313,
              1.0603601932525635, 1.0694057941436768, 1.0785285234451294,
              1.0877289772033691, 1.0970079898834229, 1.1063661575317383,
              1.1158041954040527, 1.1301021575927734, 1.1494654417037964,
              1.1691603660583496, 1.189192771911621, 1.2405647039413452,
              1.3277983665466309, 1.4211663007736206, 1.52109956741333,
              1.6280598640441895, 1.8318043947219849, 2.1710057258605957,
              2.5730178356170654, 3.0494720935821533, 3.6141531467437744,
              4.646376132965088, 6.526466369628906, 9.16730785369873,
              12.876729011535645, 18.087114334106445, 25.405807495117188,
              35.68590545654297, 50.12569808959961,
            ],
            PromptRate: [
              404051.8125, 658088.1875, 864563.375, 796124.8125, 943511.8125,
              1076238.375, 1070334.375, 1040693.5625, 1014857.0625, 1000047.75,
              990555.3125, 984797.3125, 973534.4375, 965597.1875, 957793.625,
              949785.25, 937090.75, 922220.25, 908199.3125, 892214.3125, 852962,
              791172.75, 728458.8125, 668295.9375, 611953.8125, 521658.5625,
              412611.78125, 325005.21875, 257148.546875, 204296.75, 146452.875,
              93791.5703125, 61174.44921875, 40212.1953125, 26685.357421875,
              17859.39453125, 12070.83984375, 8262.0771484375,
            ],
            RandomRate: [
              377909.8125, 603776.8125, 758694.375, 626551.625, 641821.375,
              654678, 601687.5625, 548878.9375, 511943.34375, 488057.875,
              475567.46875, 466758.0625, 452795.53125, 444436.53125,
              435499.28125, 427796.53125, 415149.71875, 401917.0625,
              388928.65625, 374526.6875, 343422.90625, 299093.34375,
              258024.6875, 222395.1875, 191260.9375, 146921.265625,
              99678.5390625, 67509.90625, 46172.7265625, 31686.0625,
              18721.779296875, 9416.8115234375, 5033.39990234375, 2889.75,
              1794.48828125, 1211.5799560546875, 884.481689453125,
              695.5399780273438,
            ],
            SinglesRate: [
              16000, 20328, 27796, 26643, 25349, 25819, 25367, 23966, 23166,
              22530, 22208, 21936, 21673, 21437, 21203, 21042, 20707, 20368,
              20016, 19663, 18800, 17536, 16276, 15098, 13990, 12232, 10057,
              8268, 6831, 5656, 4332, 3075, 2253, 1712, 1354, 1114, 955, 849,
            ],
            AcquisitionMode: 'list mode',
            ImageDecayCorrected: true,
            ImageDecayCorrectionTime: 0,
            ReconMethodName: '3D-OP-OSEM',
            ReconFilterType: 'none',
            ReconFilterSize: 0,
            AttenuationCorrection: '10-min transmission scan',
          },
          '',
        ),
      ).toHaveLength(0)
    })
  })
  it('returns expected issues for some missing sidecar fields', () => {
    expect(
      checkPetRequiredFields(
        {},
        {
          Manufacturer: 'Siemens',
          ManufacturersModelName:
            'High-Resolution Research Tomograph (HRRT, CTI/Siemens)',
          Units: 'Bq/mL',
          BodyPart: 'Brain',
          TracerName: 'SB',
          TracerRadionuclide: 'C11',
          TracerMolecularWeight: 339.8,
          TracerMolecularWeightUnits: 'g/mol',
          ScanStart: 0,
          InjectionStart: 0,
        },
        '',
      ),
    ).toHaveLength(17)
  })
  it('returns expected issues count for missing sidecar', () => {
    expect(checkPetRequiredFields({}, {}, '')).toHaveLength(24)
  })
  it('returns expected issues count if conditional field ModeOfAdministration is present', () => {
    const fieldIssues = checkPetRequiredFields(
      {},
      { ModeOfAdministration: 'bolus-infusion' },
      '',
    )
    expect(fieldIssues).toHaveLength(28)
    expect(fieldIssues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 237,
          reason: expect.stringContaining(
            'You must define ReconFilterSize for this file.',
          ),
        }),
      ]),
    )
  })
  it('returns expected issues count if conditional field ReconFilterType is present', () => {
    const checkReconFilterType = checkPetRequiredFields(
      {},
      { ReconFilterType: 'something' },
      '',
    )
    expect(checkReconFilterType).toHaveLength(26)
    expect(checkReconFilterType).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 237,
          reason: expect.stringContaining(
            'You must define ReconFilterSize for this file.',
          ),
        }),
      ]),
    )
  })
  it('returns expected issues count if reconFilterType includes ["none"]', () => {
    const checkReconFilterType = checkPetRequiredFields(
      {},
      { ReconFilterType: ['none', 'test'] },
      '',
    )
    expect(checkReconFilterType).toHaveLength(23)
    expect(checkReconFilterType).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 237,
          reason: expect.stringContaining(
            'You must define ReconFilterSize for this file.',
          ),
        }),
      ]),
    )
  })
})
