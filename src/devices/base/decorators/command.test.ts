import { beforeEach, describe, expect, jest, test } from "@jest/globals"
import { z } from "zod"

import { command } from "./command"
import { firstValueFrom } from "rxjs"
import { Device } from "../Device"
import { TEST_DRIVER_TYPE, TestDriver } from "../../../test/utils/TestDriver"
import { supportedDrivers } from "./supportedDrivers"

@supportedDrivers([TEST_DRIVER_TYPE])
class TestDevice extends Device {
  myCommandCount = 0

  @command({
    count: z.number().min(0).max(3),
    someString: z.enum(["hi", "ho"])
  })
  myCommand({ count, someString }: { count: number, someString: string }) {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        this.myCommandCount += count
  
        resolve(`${count} ${someString}`)
      }, 1000)
    })
  }

  @command({
    message: z.string()
  })
  myErrorCommand({ message }: { message: string }) {
    return new Promise<string>((resolve, reject) => {
      reject(message)
    })
  }
}

describe("command", () => {
  let device: TestDevice

  beforeEach(() => {
    device = new TestDevice(new TestDriver())
  })

  test("it adds the command schema", () => {
    expect(device.getCommandSchema("myCommand")).toEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        count: {
          maximum: 3,
          minimum: 0,
          type: "number",
        },
        someString: {
          enum: [
            "hi",
            "ho",
          ],
          type: "string",
        },
      },
      required: [
        "count",
        "someString",
      ],
      type: "object",
    })
  })

  test("it logs the command", async () => {
    jest.useFakeTimers()

    await device.open({ logDevice: true })

    const log = firstValueFrom(device.deviceLog!)

    device.myCommand({ count: 1, someString: "ho" })
    await jest.advanceTimersToNextTimerAsync(2)

    await expect(log).resolves.toEqual({
      command: "myCommand",
      parameter: {
        count: 1,
        someString: "ho"
      },
      result: "1 ho",
      timestamp: expect.any(Date)
    })
  })

  test("it logs errors", async () => {
    await device.open({ logDevice: true })

    const log = firstValueFrom(device.deviceLog!)

    await expect(device.myErrorCommand({ message: "Whoopsie" })).rejects.toBeTruthy()

    await expect(log).resolves.toEqual({
      command: "myErrorCommand",
      error: "Whoopsie",
      parameter: {
        message: "Whoopsie"
      },
      timestamp: expect.any(Date)
    })
  })

  test("it locks the command", async () => {
    jest.useFakeTimers()

    expect(device.myCommandCount).toBe(0)
    const firstCommand = device.myCommand({ count: 1, someString: "hi" }) // we run the command
    expect(device.myCommandCount).toBe(0)

    await jest.advanceTimersByTimeAsync(500) // we run another command (the first one is still running)

    expect(device.myCommandCount).toBe(0)
    const secondCommand = device.myCommand({ count: 3, someString: "hi" })
    expect(device.myCommandCount).toBe(0)

    await jest.advanceTimersByTimeAsync(500) // the first command finished
    await expect(firstCommand).resolves.toBeTruthy()
    expect(device.myCommandCount).toBe(1)

    await jest.advanceTimersByTimeAsync(500) // the second command didn't finish yet, because the mutex was locked
    expect(device.myCommandCount).toBe(1)

    await jest.advanceTimersByTimeAsync(1000) // the second command finished
    await expect(secondCommand).resolves.toBeTruthy()
    expect(device.myCommandCount).toBe(4)
  })

  test("it releases the lock upon error", async () => {
    await expect(device.myErrorCommand({ message: "one" })).rejects.toEqual("one")
    await expect(device.myErrorCommand({ message: "two" })).rejects.toEqual("two")
  })

  test("it parses the parameter", async () => {
    await expect(() => device.myCommand({ count: 99, someString: "abc" })).rejects.toThrow("Number must be less than or equal to 3")
    await expect(() => device.myCommand({ count: 99, someString: "abc" })).rejects.toThrow("Invalid enum value. Expected 'hi' | 'ho', received 'abc'")
  })
})
