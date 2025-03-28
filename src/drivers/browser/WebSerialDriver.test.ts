import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { WebSerialDriver } from "./WebSerialDriver";
import { DriverType } from "../base/DriverType";
import { firstValueFrom } from "rxjs";

describe("WebSerialDriver", () => {
  let driver: WebSerialDriver
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reader: any
  let serialPort: SerialPort
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let writer: any

  beforeEach(() => {
    reader = {
      cancel: jest.fn(),
      read: jest.fn()
        .mockImplementationOnce(() => Promise.resolve({ value: new Uint8Array([1, 2, 3]) }))
        .mockImplementationOnce(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (serialPort as any).readable = null

          return Promise.resolve({ done: true })
        }),
      releaseLock: jest.fn()
    }

    writer = {
      releaseLock: jest.fn(),
      write: jest.fn()
    }

    serialPort = {
      close: jest.fn(),
      open: jest.fn(),
      readable: {
        getReader: () => reader
      },
      writable: {
        getWriter: () => writer
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    driver = new WebSerialDriver(serialPort, { baudRate: 4800 })

    jest.restoreAllMocks()
  })

  test("type", () => expect(driver.type).toEqual(DriverType.WebSerialDriver))

  describe("observable", () => {
    test("it reads from the serial port", async () => {
      await expect(firstValueFrom(driver.observable)).resolves.toEqual(new Uint8Array([1, 2, 3]))
    })
  })

  describe("open", () => {
    test("opens the serial port", async () => {
      await driver.open()

      expect(serialPort.open).toHaveBeenCalledWith({ baudRate: 4800 })
    })
  })

  describe("write", () => {
    test("writes to the serial port", async () => {
      await driver.write(new Uint8Array([1, 2, 3]))

      expect(writer.write).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]))
      expect(writer.releaseLock).toHaveBeenCalled()
    })
  })

  describe("close", () => {
    test("it closes the serial port", async () => {
      await driver.close()

      expect(serialPort.close).toHaveBeenCalled()
    })

    test("when a reader is locked", async () => {
      driver.observable.subscribe(() => { })

      await driver.close()

      expect(reader.cancel).toHaveBeenCalled()
    })
  })
})
