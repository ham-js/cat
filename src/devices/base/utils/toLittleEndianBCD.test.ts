import { describe, expect, test } from "@jest/globals"
import { fromLittleEndianBCD } from "./fromLittleEndianBCD"
import { toLittleEndianBCD } from "./toLittleEndianBCD"

describe("toLittleEndianBCD", () => {
  test("it converts 1234", () => expect(toLittleEndianBCD(1234)).toEqual(new Uint8Array([0b0011_0100, 0b0001_0010])))
  test("it converts 7_250_000", () => expect(toLittleEndianBCD(7_250_000)).toEqual(new Uint8Array([0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111])))
  test("it converts 14_250_300", () => expect(toLittleEndianBCD(14_250_300)).toEqual(new Uint8Array([0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100])))
  test("it is the inverse of fromLittleEndianBCD", () => expect(toLittleEndianBCD(fromLittleEndianBCD(new Uint8Array([0b0011_0100, 0b1001_0101])))).toEqual(new Uint8Array([0b0011_0100, 0b1001_0101])))
})
