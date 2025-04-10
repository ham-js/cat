import { describe, expect, test } from "@jest/globals";
import { invertMap } from "./invertMap";

describe("invert", () => {
  test("it inverts objects", () => {
    expect(
      invertMap(new Map([[1, 2], [3, 4], [4, 4]]))
    ).toEqual(new Map([[2, 1], [4, 4]]))
  })
})
