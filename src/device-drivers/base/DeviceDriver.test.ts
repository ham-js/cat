import { beforeEach, describe, expect, jest, test } from "@jest/globals"

import { DeviceDriver } from "./DeviceDriver"
import { Command } from "./Command"
import { TestCommunicationDriver } from "../../test/utils/TestCommunicationDriver"
import { z } from "zod"
import { Mutex } from "async-mutex"
import { LogDriver } from "../../communication-drivers/LogDriver"

const testCommand = Object.assign(
  jest.fn(({ param }) => Promise.resolve(`hi, ${param}`)),
  {
    parameterType: z.object({
      param: z.number().max(0)
    })
  })

class TestDeviceDriver extends DeviceDriver<{
  notImplementedCommand?: Command<{ param: number }, string>,
  optionalCommand?: Command<{ param: number }, string>,
  testCommand: Command<{ param: number }, Promise<string>>
}> {
  readonly _commands = {
    testCommand,
    optionalCommand: testCommand
  }
}

describe("DeviceDriver", () => {
  const testCommunicationDriver = new TestCommunicationDriver()
  let testDeviceDriver = new TestDeviceDriver(testCommunicationDriver)

  beforeEach(async () => {
    testDeviceDriver = new TestDeviceDriver(testCommunicationDriver)

    await testDeviceDriver.open()

    testCommand.mockClear()
  })

  describe("startLogging", () => {
    test("starts logging", () => {
      expect(testDeviceDriver.log).toBeFalsy()

      testDeviceDriver["startLogging"]()

      expect(testDeviceDriver.log).toBeTruthy()
    })

    test("is idempotent", () => {
      testDeviceDriver["startLogging"]()

      const log = testDeviceDriver.log

      testDeviceDriver["startLogging"]()

      expect(testDeviceDriver.log).toEqual(log)
    })
  })

  describe("stopLogging", () => {
    test("stops logging", () => {
      testDeviceDriver["startLogging"]()

      expect(testDeviceDriver.log).toBeTruthy()

      testDeviceDriver["stopLogging"]()

      expect(testDeviceDriver.log).toBeFalsy()
      expect(testDeviceDriver["communicationDriver"] instanceof LogDriver).toBe(false)
    })
  })

  describe("open", () => {
    test("opens the communication driver", async () => {
      await testDeviceDriver.open()

      expect(testCommunicationDriver.open).toHaveBeenCalled()
      expect(testDeviceDriver.isOpen).toBe(true)
    })

    test("allows to log", async () => {
      await testDeviceDriver.open({ log: true })

      expect(testDeviceDriver.log).toBeTruthy()
    })
  })

  describe("close", () => {
    test("closes the communication driver", async () => {
      await testDeviceDriver.close()

      expect(testCommunicationDriver.close).toHaveBeenCalled()
      expect(testDeviceDriver.isOpen).toBe(false)
    })
  })

  describe("sendCommand", () => {
    test("it parses params", async () => {
      await expect(testDeviceDriver.sendCommand("testCommand", { param: 1 })).rejects.toThrow("Number must be less than or equal to 0")
    })

    test("it calls the command", async () => {
      await expect(testDeviceDriver.sendCommand("testCommand", { param: 0 })).resolves.toBe("hi, 0")
    })

    test("it locks command calls", async () => {
      const release = jest.fn()
      const acquire = jest.spyOn(Mutex.prototype, "acquire").mockImplementation(() => Promise.resolve(release))

      await testDeviceDriver.sendCommand("testCommand", {param: 0})

      const mutexAcquireOrder = acquire.mock.invocationCallOrder[0]
      const mutexReleaseOrder = release.mock.invocationCallOrder[0]
      const testCommandOrder = testCommand.mock.invocationCallOrder[0]

      expect(mutexAcquireOrder).toBeLessThan(testCommandOrder)
      expect(testCommandOrder).toBeLessThan(mutexReleaseOrder)
    })
  })

  describe("implementsCommand", () => {
    test("it returns whether the class implements an optional command", () => {
      expect(testDeviceDriver.implementsCommand("testCommand")).toBe(true)
      expect(testDeviceDriver.implementsCommand("optionalCommand")).toBe(true)
      expect(testDeviceDriver.implementsCommand("notImplementedCommand")).toBe(false)
    })
  })

  describe("getCommandKeys", () => {
    test("returns all command that are implemented", () => {
      expect(testDeviceDriver.getCommandKeys()).toEqual(["testCommand", "optionalCommand"])
    })
  })

  describe("getCommandSchema", () => {
    test("it returns a JSON schema for the command", () => {
      expect(testDeviceDriver.getCommandSchema("testCommand")).toEqual({
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
