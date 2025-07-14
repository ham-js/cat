/**
 *  Convert an input in little endian BCD to number
 *  @param {Uint8Array} input data formatted in little endian BCD
 *  @returns {number} The number described by the input data
 */
export const fromLittleEndianBCD = (input: Uint8Array): number => [...input]
  .reduce((result, byte, i) => result + 100**i * (((byte & 0xF0) >> 4) * 10 + (byte & 0x0F)), 0)
