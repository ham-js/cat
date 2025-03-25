import { describe, expect, test } from "@jest/globals";
import { getDigit } from './getDigit'

describe("getDigit", () => {
  test("gets the digit correctly", () => {
    expect(getDigit(123, 0)).toBe(3)
    expect(getDigit(123, 1)).toBe(2)
    expect(getDigit(123, 2)).toBe(1)
    expect(getDigit(123.456, 0)).toBe(3)
    expect(getDigit(123, 3)).toBe(0)
  })
})
