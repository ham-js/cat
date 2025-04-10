import { describe, expect, test } from "@jest/globals"
import { firstValueFrom } from "rxjs"
import { TestDriver } from "../../test/utils/TestDriver"

describe("Driver", () => {
  const driver = new TestDriver()

  test("isOpen", async () => {
    expect(driver.isOpen).toBe(false)
    await driver.open()
    expect(driver.isOpen).toBe(true)
    await driver.close()
    expect(driver.isOpen).toBe(false)
  })

  test("writeString", () => {
    driver.writeString("abc")
    expect(driver.write).toHaveBeenCalledWith(new Uint8Array([97, 98, 99]))
  })

  test("stringData", async () => {
    const result = firstValueFrom(driver.stringData())

    driver.send(new Uint8Array([65, 66, 67]))

    await expect(result).resolves.toBe("ABC")
  })
})
