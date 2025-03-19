import { describe, expect, it } from "@jest/globals"
import { delimiterParser } from "./delimiterParser"
import { firstValueFrom, of, toArray } from "rxjs"

describe("delimiterParser", () => {
  it("correctly parses byte arrays", async () => {
    const source = of(
      new Uint8Array([0xFE, 0xFE, 0x25, 0x00]),
      new Uint8Array([0xFD, 0xFE, 0xFE, 0x00, 0x00, 0xFD])
    )

    expect(await firstValueFrom(delimiterParser(source, 0xFD).pipe(toArray()))).toEqual([
      new Uint8Array([0xFE, 0xFE, 0x25, 0x00, 0xFD]),
      new Uint8Array([0xFE, 0xFE, 0x00, 0x00, 0xFD])
    ])
  })

  it("correctly parses strings", async () => {
    const source = of(
      "FA",
      "014",
      "250",
      "000;FB",
      ";"
    )

    expect(await firstValueFrom(delimiterParser(source, ";").pipe(toArray()))).toEqual([
      "FA014250000;",
      "FB;"
    ])
  })
})
