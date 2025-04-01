import { beforeEach, describe, expect, jest, test } from "@jest/globals"

import { SerialPortMock } from "serialport"

import { SerialPortDriver } from "./SerialPortDriver"
import { firstValueFrom } from "rxjs"

describe("SerialPortDriver", () => {
  SerialPortMock.binding.createPort("/dev/tty.MyTransceiver")
  const serialPort = new SerialPortMock({
    autoOpen: false,
    baudRate: 9600,
    path: "/dev/tty.MyTransceiver"
  })
  const driver = new SerialPortDriver(serialPort)

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe("open", () => {
    test("it opens the serial port", async () => {
      await driver.open()

      expect(driver.isOpen).toBe(true)
    })
  })

  describe("observable", () => {
    test("it returns data from the serial port", async () => {
      driver.open()
      const result = firstValueFrom(driver.data)

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

      await expect(driver.write(new Uint8Array([1, 2, 3]))).rejects.toEqual(new Error("Whoopsie"))
    })

    test("it rejects upon drain failure", async () => {
      jest.spyOn(SerialPortMock.prototype, "drain").mockImplementation((callback) => {
        callback?.(new Error("Whoopsie"))

        return true
      })

      await expect(driver.write(new Uint8Array([1, 2, 3]))).rejects.toEqual(new Error("Whoopsie"))
    })

    test("it rejects upon timeout", async () => {
      jest.useFakeTimers()

      jest.spyOn(SerialPortMock.prototype, "drain").mockImplementation(() => true)

      const result = driver.write(new Uint8Array([1, 2, 3]))
      jest.advanceTimersByTime(1000)

      await expect(result).rejects.toEqual(new Error("Timeout during write"))
    })
  })
})
