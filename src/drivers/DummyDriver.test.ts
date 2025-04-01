import { describe, expect, test } from "@jest/globals"
import { EMPTY } from "rxjs"

import { DummyDriver } from "./DummyDriver"

describe("DummyDriver", () => {
  const dummyDriver = new DummyDriver()

  describe("observable", () => {
    test("it is empty", () => {
      expect(dummyDriver.data).toEqual(EMPTY)
    })
  })

  describe("write", () => {
    test("doesn't do anything", () => {
      expect(() => dummyDriver.write(new Uint8Array([1, 2, 3]))).not.toThrow()
    })
  })
})
