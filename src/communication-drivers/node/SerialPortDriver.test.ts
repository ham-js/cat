import { beforeEach, describe, expect, jest, test } from "@jest/globals"

import { SerialPortMock } from "serialport"

import { SerialPortDriver } from "./SerialPortDriver"
import { firstValueFrom } from "rxjs"

describe("SerialPortDriver", () => {
  SerialPortMock.binding.createPort("/dev/tty.MyTransceiver")
  const serialPort = new SerialPortMock({
    baudRate: 9600,
    path: "/dev/tty.MyTransceiver"
  })
  const driver = new SerialPortDriver(serialPort)

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe("observable", () => {
    test("it returns data from the serial port", async () => {
      await new Promise((resolve) => serialPort.on("open", resolve))

      const result = firstValueFrom(driver.observable)

      serialPort.port?.emitData(Buffer.from([65, 66, 67]))
      await expect(result).resolves.toEqual(Buffer.from([65, 66, 67]))
    })
  })

  describe("write", () => {
    test("it writes to the serial port", async () => {
      await driver.write(new Uint8Array([1, 2, 3]))

      expect(serialPort.port?.lastWrite).toEqual(Buffer.from([1, 2, 3]))
    })

    test("it rejects upon write failure", async () => {
      jest.spyOn(SerialPortMock.prototype, "write").mockImplementation((data, callback) => {
        callback?.(new Error("Whoopsie"))

        return true
      })

      await expect(driver.write(new Uint8Array([1, 2, 3]))).rejects.toBe(undefined)
    })

    test("it rejects upon drain failure", async () => {
      jest.spyOn(SerialPortMock.prototype, "drain").mockImplementation((callback) => {
        callback?.(new Error("Whoopsie"))

        return true
      })

      await expect(driver.write(new Uint8Array([1, 2, 3]))).rejects.toBe(undefined)
    })

    test("it rejects upon timeout", async () => {
      jest.useFakeTimers()

      jest.spyOn(SerialPortMock.prototype, "drain").mockImplementation(() => true)

      const result = driver.write(new Uint8Array([1, 2, 3]))
      jest.advanceTimersByTime(1000)

      await expect(result).rejects.toBe(undefined)
    })
  })
})
