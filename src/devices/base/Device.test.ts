import { beforeEach, describe, expect, jest, test } from "@jest/globals"

import { Device } from "./Device"
import { Command } from "./Command"
import { TestSerialPort } from "../../test/utils/TestSerialPort"
import { z } from "zod"
import { Mutex } from "async-mutex"

const testCommand = Object.assign(
  jest.fn(({ param }) => `hi, ${param}`),
  {
    parameterType: z.object({
      param: z.number().max(0)
    })
  })

class TestDevice extends Device<{
  notImplementedCommand?: Command<{ param: number }, string>,
  optionalCommand?: Command<{ param: number }, string>,
  testCommand: Command<{ param: number }, string>
}> {
  readonly _commands = {
    testCommand,
    optionalCommand: testCommand
  }
}

describe("Device", () => {
  const testSerialPort = new TestSerialPort()
  const testDevice = new TestDevice(testSerialPort)

  beforeEach(() => {
    testCommand.mockClear()
  })

  describe("sendCommand", () => {
    test("it parses params", async () => {
      await expect(testDevice.sendCommand("testCommand", { param: 1 })).rejects.toThrow("Number must be less than or equal to 0")
    })

    test("it calls the command", async () => {
      await expect(testDevice.sendCommand("testCommand", { param: 0 })).resolves.toBe("hi, 0")
    })

    test("it locks command calls", async () => {
      const release = jest.fn()
      const acquire = jest.spyOn(Mutex.prototype, "acquire").mockImplementation(() => Promise.resolve(release))

      await testDevice.sendCommand("testCommand", {param: 0})

      const mutexAcquireOrder = acquire.mock.invocationCallOrder[0]
      const mutexReleaseOrder = release.mock.invocationCallOrder[0]
      const testCommandOrder = testCommand.mock.invocationCallOrder[0]

      expect(mutexAcquireOrder).toBeLessThan(testCommandOrder)
      expect(testCommandOrder).toBeLessThan(mutexReleaseOrder)
    })
  })

  describe("implementsCommand", () => {
    test("it returns whether the class implements an optional command", () => {
      expect(testDevice.implementsCommand("testCommand")).toBe(true)
      expect(testDevice.implementsCommand("optionalCommand")).toBe(true)
      expect(testDevice.implementsCommand("notImplementedCommand")).toBe(false)
    })
  })

  describe("getCommandKeys", () => {
    test("returns all command that are implemented", () => {
      expect(testDevice.getCommandKeys()).toEqual(["testCommand", "optionalCommand"])
    })
  })

  describe("getCommandSchema", () => {
    test("it returns a JSON schema for the command", () => {
      expect(testDevice.getCommandSchema("testCommand")).toEqual({
        $schema: "http://json-schema.org/draft-07/schema#",
        additionalProperties: false,
        properties: {
          param: {
            maximum: 0,
            type: "number",
          },
        },
        required: [
          "param",
        ],
        type: "object",
      })
    })
  })
})
