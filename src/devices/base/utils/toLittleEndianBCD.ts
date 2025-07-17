import { getDigit } from "./getDigit";
import { getNumberOfDigits } from "./getNumberOfDigits";

/**
 *  Converts an input number to BCD in little endian byte order.
 *  @param {number} input The input number
 *  @returns {Uint8Array} the BCD representation of the input number in little endian byte order
 */
export const toLittleEndianBCD = (input: number): Uint8Array =>
  new Uint8Array(Math.ceil(getNumberOfDigits(input) / 2))
    .fill(0)
    .map((_empty, i) => getDigit(input, (i * 2) + 1) << 4 | getDigit(input, i * 2))
