import { describe, expect, test } from "@jest/globals"

import { TestSerialPort } from "../../test/utils/TestSerialPort"
import { firstValueFrom } from "rxjs"

describe("SerialPort", () => {
  const serialPort = new TestSerialPort()

  test("writeString", () => {
    serialPort.writeString("abc")
    expect(serialPort.write).toHaveBeenCalledWith(new Uint8Array([97, 98, 99]))
  })

  test("stringObservable", async () => {
    const result = firstValueFrom(serialPort.stringObservable())

    serialPort.write(new Uint8Array([65, 66, 67]))

    await expect(result).resolves.toBe("ABC")
  })
})
