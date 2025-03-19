import { describe, expect, test } from "@jest/globals";

import { fromLittleEndianBCD } from "./fromLittleEndianBCD"
import { toLittleEndianBCD } from "./toLittleEndianBCD";

describe("fromLittleEndianBCD", () => {
  test("it converts 0b0011_0100_0001_0010", () => expect(fromLittleEndianBCD(new Uint8Array([0b0011_0100, 0b0001_0010]))).toEqual(1234))
  test("it converts 0b0000_0000_0000_0011_0010_0101_0001_0100", () => expect(fromLittleEndianBCD(new Uint8Array([0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100]))).toEqual(14_250_300))
  test("it is the inverse of toLittleEndianBCD", () => expect(fromLittleEndianBCD(toLittleEndianBCD(12345678))).toEqual(12345678))
})
