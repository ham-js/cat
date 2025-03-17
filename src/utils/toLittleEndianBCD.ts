import { getDigit } from "./getDigit";
import { getNumberOfDigits } from "./getNumberOfDigits";

export const toLittleEndianBCD = (input: number): Uint8Array =>
  new Uint8Array(Math.ceil(getNumberOfDigits(input)) / 2)
    .fill(0)
    .map((_empty, i) => getDigit(input, (i * 2) + 1) << 4 | getDigit(input, i * 2))
