/**
 *  Pad an input with zero bytes until it reaches a certain length
 *  @param {Uint8Array} input Input data
 *  @param {number} length the length in bytes the output should be long
 *  @returns {Uint8Array} the input data padded with zero bytes at the end (or the input data itself if it already had the appropriate length)
 */
export const padBytesEnd = (input: Uint8Array, length: number): Uint8Array => input.length >= length ? input : new Uint8Array([...input, ...Array(length - input.length).fill(0)])
