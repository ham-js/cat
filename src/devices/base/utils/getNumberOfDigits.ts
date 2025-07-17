/**
 *  Get the number of digits of an integer number
 *  @param {number} input The input number
 *  @returns {number} The number of digits of the input number
 */
export const getNumberOfDigits = (input: number): number => Math.ceil(Math.log10(input + 1))
