import { describe, expect, test } from "@jest/globals";
import { invert } from "./invert";

describe("invert", () => {
  test("it inverts objects", () => {
    expect(
      invert({
        a: 1,
        b: 2,
        c: 3,
        d: 3
      })
    ).toEqual({
      [1]: "a",
      [2]: "b",
      [3]: "d"
    })
  })
})
