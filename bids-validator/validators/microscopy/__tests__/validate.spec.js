import path from 'path'

import validate from '../validate'

const dataDir = path.join(__dirname, '/data')

const jsonContent = {
  Manufacturer: 'Miltenyi Biotec',
  ManufacturersModelName: 'UltraMicroscope II',
  BodyPart: 'CSPINE',
  SampleEnvironment: 'ex vivo',
  SampleFixation: '4% paraformaldehyde, 2% glutaraldehyde',
  SampleStaining: 'Luxol fast blue',
  PixelSize: [1, 1, 1],
  PixelSizeUnits: 'um',
  Immersion: 'Oil',
  NumericalAperture: 1.4,
  Magnification: 40,
  ChunkTransformationMatrix: [
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ],
  ChunkTransformationMatrixAxis: ['X', 'Y', 'Z'],
}

describe('validate', () => {
  it('returns error 227 with extension/id mismatch', () => {
    const fileName = 'btif_id.ome.tif'
    const files = [
      {
        name: fileName,
        relativePath: `/bids-validator/validators/microscopy/__tests__/data/${fileName}`,
        path: path.join(dataDir, fileName),
      },
    ]

    expect.assertions(3)
    return validate(files, {}).then((issues) => {
      expect(issues.length).toBe(2)
      expect(issues[0].code).toBe(227)
      expect(issues[1].code).toBe(226)
    })
  })

  it('returns error 227 with incorrect id in magic number', () => {
    const fileName = 'invalid_id.ome.tif'
    const files = [
      {
        name: fileName,
        relativePath: `/bids-validator/validators/microscopy/__tests__/data/${fileName}`,
        path: path.join(dataDir, fileName),
      },
    ]
    expect.assertions(2)
    return validate(files, {}).then((issues) => {
      expect(issues.length).toBe(1)
      expect(issues[0].code).toBe(227)
    })
  })

  it('returns error 227 with tif id and btf extension', () => {
    const fileName = 'tif_id.ome.btf'
    const files = [
      {
        name: fileName,
        relativePath: `/bids-validator/validators/microscopy/__tests__/data/${fileName}`,
        path: path.join(dataDir, fileName),
      },
    ]

    expect.assertions(2)
    return validate(files, {}).then((issues) => {
      expect(issues.length).toBe(1)
      expect(issues[0].code).toBe(227)
    })
  })

  it('validates with valid data', () => {
    const fileName = 'valid.ome.tif'
    const relativePath = `/bids-validator/validators/microscopy/__tests__/data/${fileName}`
    const files = [
      {
        name: fileName,
        relativePath: relativePath,
        path: path.join(dataDir, fileName),
      },
    ]
    const jsonContentDict = {}
    jsonContentDict[relativePath.replace('.ome.tif', '.json')] = jsonContent

    expect.assertions(1)
    return validate(files, jsonContentDict).then((issues) => {
      expect(issues.length).toBe(0)
    })
  })
})
