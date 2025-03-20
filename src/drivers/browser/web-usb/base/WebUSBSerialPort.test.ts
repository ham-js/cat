import { describe, expect, jest, test } from "@jest/globals";

import { Subject } from "rxjs";
import { WebUSBSerialPort } from "./WebUSBSerialPort"

class TestWebUSBSerialPort extends WebUSBSerialPort {
  static readonly deviceFilters = [
    {vendorId: 0x1234, productId: 0x5678}
  ]
  subject = new Subject<Uint8Array>()
  observable = this.subject.asObservable()

  write = jest.fn(() => Promise.resolve())
}

describe("WebUSBSerialPort", () => {
  describe("constructor", () => {
    test("validates the device against the device filters", () => {
      expect(() => new TestWebUSBSerialPort({} as USBDevice)).toThrow("USBDevice doesn't match device filters")
      expect(() => new TestWebUSBSerialPort({vendorId: 0x1234, productId: 0x5678} as USBDevice)).not.toThrow()
    })
  })

  describe("open", () => {
    test("opens the usb device", async () => {
      const usbDevice = {
        open: jest.fn(),
        productId: 0x5678,
        vendorId: 0x1234,
      }
      const serialPort = new TestWebUSBSerialPort(usbDevice as unknown as USBDevice)

      await serialPort.open()
      expect(usbDevice.open).toHaveBeenCalled()
    })
  })

  describe("close", () => {
    test("closes the usb device", async () => {
      const usbDevice = {
        close: jest.fn(),
        productId: 0x5678,
        vendorId: 0x1234,
      }
      const serialPort = new TestWebUSBSerialPort(usbDevice as unknown as USBDevice)

      await serialPort.close()
      expect(usbDevice.close).toHaveBeenCalled()
    })
  })
})
