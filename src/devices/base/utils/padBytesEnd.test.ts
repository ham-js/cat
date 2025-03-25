import { describe, expect, it } from "@jest/globals";

import { padBytesEnd } from "./padBytesEnd"

describe("padBytesEnd", () => {
  it("pads with 0 bytes at the end", () => {
    expect(padBytesEnd(new Uint8Array([1, 2]), 4)).toEqual(new Uint8Array([1, 2, 0, 0]))
    expect(padBytesEnd(new Uint8Array([1, 2]), 3)).toEqual(new Uint8Array([1, 2, 0]))
    expect(padBytesEnd(new Uint8Array([1, 2]), 2)).toEqual(new Uint8Array([1, 2]))
    expect(padBytesEnd(new Uint8Array([1, 2]), 1)).toEqual(new Uint8Array([1, 2]))
  })
})
