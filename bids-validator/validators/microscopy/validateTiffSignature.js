import isNode from '../../utils/isNode'

const getDataView = (buffer) => {
  if (isNode) {
    const uint8arr = new Uint8Array(buffer.byteLength)
    buffer.copy(uint8arr, 0, 0, buffer.byteLength)
    return new DataView(uint8arr.buffer)
  } else {
    return new DataView(buffer)
  }
}

const validateTiffSignature = (buffer, tiffId) => {
  const dataView = getDataView(buffer)
  const littleEndian = dataView.getUint16(0) === 0x4949

  return dataView.getUint16(2, littleEndian) === tiffId
}

export default validateTiffSignature
