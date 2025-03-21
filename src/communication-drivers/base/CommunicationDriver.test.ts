import { describe, expect, test } from "@jest/globals"

import { TestCommunicationDriver } from "../../test/utils/TestCommunicationDriver"
import { firstValueFrom } from "rxjs"

describe("CommunicationDriver", () => {
  const driver = new TestCommunicationDriver()

  test("writeString", () => {
    driver.writeString("abc")
    expect(driver.write).toHaveBeenCalledWith(new Uint8Array([97, 98, 99]))
  })

  test("stringObservable", async () => {
    const result = firstValueFrom(driver.stringObservable())

    driver.write(new Uint8Array([65, 66, 67]))

    await expect(result).resolves.toBe("ABC")
  })
})
