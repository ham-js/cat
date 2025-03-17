import { describe, expect, it } from "@jest/globals";

import { getNumberOfDigits } from "./getNumberOfDigits"

describe("getNumberOfDigits", () => {
  it("returns the number of digits", () => {
    expect(getNumberOfDigits(10)).toBe(2)
    expect(getNumberOfDigits(1)).toBe(1)
    expect(getNumberOfDigits(123)).toBe(3)
    expect(getNumberOfDigits(40_123)).toBe(5)
  })
})
