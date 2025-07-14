/**
 *  Get the n-th digit of a (integer) number
 *  @param {number} input the input number
 *  @param {number} n the index of the digit to return
 *  @returns {number} the digit at index n of the input number
 */
export const getDigit = (input: number, n: number): number => Math.floor(input / (10 ** n)) % 10
