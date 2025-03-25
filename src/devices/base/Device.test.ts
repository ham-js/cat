import { beforeEach, describe, expect, test } from "@jest/globals"
import { z } from "zod"

import { command } from "devices/base/decorators/command"
import { Device } from "devices/base/Device"
import { DummyDriver } from "drivers/DummyDriver"
import { LogDriver } from "drivers/LogDriver"
import { TestDriver } from "test/utils/TestDriver"

class TestDevice extends Device {
  @command({
    param: z.number().min(0)
  })
  commandA({ param }: { param: number }) {
    return Promise.resolve(param)
  }

  @command({
    test: z.string()
  })
  commandB({ test }: { test: string }) {
    return Promise.resolve(test)
  }

  noCommand() {}
}

describe("DeviceDriver", () => {
  const driver = new TestDriver()
  let device: TestDevice

  beforeEach(async () => {
    device = new TestDevice(driver)

    await device.open()
  })

  describe.skip("constructor", () => {
    test("checks that the communication driver is supported", () => {
      expect(() => new TestDevice(new DummyDriver())).toThrow("This communication driver is not supported by this device driver")
    })
  })

  describe("startLogging", () => {
    test("starts logging", () => {
      expect(device.log).toBeFalsy()

      device["startLogging"]()

      expect(device.log).toBeTruthy()
    })

    test("is idempotent", () => {
      device["startLogging"]()

      const log = device.log

      device["startLogging"]()

      expect(device.log).toEqual(log)
    })
  })

  describe("stopLogging", () => {
    test("stops logging", () => {
      device["startLogging"]()

      expect(device.log).toBeTruthy()

      device["stopLogging"]()

      expect(device.log).toBeFalsy()
      expect(device["driver"] instanceof LogDriver).toBe(false)
    })
  })

  describe("open", () => {
    test("opens the communication driver", async () => {
      await device.open()

      expect(driver.open).toHaveBeenCalled()
      expect(device.isOpen).toBe(true)
    })

    test("allows to log", async () => {
      await device.open({ log: true })

      expect(device.log).toBeTruthy()
    })
  })

  describe("close", () => {
    test("closes the communication driver", async () => {
      await device.close()

      expect(driver.close).toHaveBeenCalled()
      expect(device.isOpen).toBe(false)
    })
  })

  describe("getCommands", () => {
    test("it returns the commands", () => {
      expect(device.getCommands()).toEqual(["commandA", "commandB"])
    })
  })

  describe("getCommandSchema", () => {
    test("it returns a JSON schema for the command", () => {
      expect(device.getCommandSchema("commandA")).toEqual({
        $schema: "http://json-schema.org/draft-07/schema#",
        additionalProperties: false,
        properties: {
          param: {
            minimum: 0,
            type: "number",
          },
        },
        required: [
          "param",
        ],
        type: "object",
      })

      expect(device.getCommandSchema("commandB")).toEqual({
        $schema: "http://json-schema.org/draft-07/schema#",
        additionalProperties: false,
        properties: {
          test: {
            type: "string",
          },
        },
        required: [
          "test",
        ],
        type: "object",
      })
    })

    test("it returns an error when the method does not exist", () => {
      expect(() => device.getCommandSchema("notThere")).toThrow("The command `notThere` does not exist on this device")
    })

    test("it returns an error when the method is not a commqand", () => {
      expect(() => device.getCommandSchema("noCommand")).toThrow("Couldn't find a command parameter schema for the command `noCommand`. Did you forget to declare the command using the @command({}) decorator?")
    })
  })
})
