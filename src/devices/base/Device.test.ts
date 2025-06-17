import { beforeEach, describe, expect, jest, test } from "@jest/globals"
import { z } from "zod"
import { Device } from "./Device"
import { command } from "./decorators/command"
import { TEST_DRIVER_TYPE, TestDriver } from "../../test/utils/TestDriver"
import { TransceiverVendor } from "../transceivers"
import { DriverType } from "../../drivers"
import { supportedDrivers } from "./decorators/supportedDrivers"

@supportedDrivers([
  TEST_DRIVER_TYPE
])
class TestDevice extends Device {
  static deviceVendor = TransceiverVendor.Kenwood
  static deviceName = "Test"

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
  })

  test("displayName", () => expect(TestDevice.displayName).toEqual("Kenwood Test"))
  test("deviceSchema", () => expect(Device.deviceSchema).toEqual({}))
  test("supportedDrivers", () => expect(Device.supportedDrivers).toEqual(Object.values(DriverType)))

  describe("open", () => {
    test("opens the communication driver", async () => {
      await device.open()

      expect(driver.open).toHaveBeenCalled()
      expect(device.isOpen).toBe(true)
    })

    test("allows to log", async () => {
      await device.open({ log: true })

      expect(device.driverLog).toBeTruthy()
      expect(device.deviceLog).toBeTruthy()
    })

    test("allows to log device", async () => {
      await device.open({ logDevice: true })

      expect(device.driverLog).toBeFalsy()
      expect(device.deviceLog).toBeTruthy()
    })

    test("allows to log driver", async () => {
      await device.open({ logDriver: true })

      expect(device.driverLog).toBeTruthy()
      expect(device.deviceLog).toBeFalsy()
    })
  })

  describe("close", () => {
    test("closes the communication driver", async () => {
      await device.close()

      expect(driver.close).toHaveBeenCalled()
      expect(device.isOpen).toBe(false)
    })

    test("stops logging", async () => {
      await device.open({ logDevice: true })
      await device.close()

      expect(device.deviceLog).toBeFalsy()
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

  describe("readResponse", () => {
    class StringDevice extends Device<string> {
      data = this.driver.stringData()
    }

    class Uint8ArrayDevice extends Device<Uint8Array> {
      data = this.driver.data
    }

    const driver = new TestDriver()
    const stringDevice = new StringDevice(driver)
    const uint8ArrayDevice = new Uint8ArrayDevice(driver)

    beforeEach(() => {
      jest.spyOn(driver, "writeString")
    })

    test("it sends a string command and reads back the response", async () => {
      const result = stringDevice["readResponse"]("TEST", (response) => response.length > 3 ? response.charAt(2) : null)

      expect(driver.writeString).toHaveBeenCalledWith("TEST")
      driver.send("AB;") // this returns null in the map fn
      driver.send("CDE;")

      await expect(result).resolves.toEqual("E")
    })

    test("it sends a byte command and reads back the response", async () => {
      const result = uint8ArrayDevice["readResponse"](new Uint8Array([65, 66, 67]), (response) => response.length > 3 ? response[2] : null)

      expect(driver.write).toHaveBeenCalledWith(new Uint8Array([65, 66, 67]))
      driver.send(new Uint8Array([65, 66, 67])) // this returns null in the map fn
      driver.send(new Uint8Array([68, 69, 70, 71]))

      await expect(result).resolves.toEqual(70)
    })

    test("it implements a timeout for string commands", async () => {
      jest.useFakeTimers()

      const result = stringDevice["readResponse"]("TEST", (response) => response.length > 3 ? response.charAt(2) : null)

      // this is a trick to prevent the promise to reject before jest's expect can handle the error because we advance the timer for the timeout
      try {
        return expect(result).rejects.toThrow("Timeout has occurred")
      } finally {
        await jest.advanceTimersToNextTimerAsync()
      }
    })

    test("it implements a timeout for byte commands", async () => {
      jest.useFakeTimers()

      const result = uint8ArrayDevice["readResponse"](new Uint8Array([65, 66, 67]), (response) => response.length > 3 ? response[2] : null)

      // this is a trick to prevent the promise to reject before jest's expect can handle the error because we advance the timer for the timeout
      try {
        return expect(result).rejects.toThrow("Timeout has occurred")
      } finally {
        await jest.advanceTimersToNextTimerAsync()
      }
    })
  })

})
