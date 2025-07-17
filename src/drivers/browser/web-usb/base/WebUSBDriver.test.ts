import { describe, expect, jest, test } from "@jest/globals";

import { Subject } from "rxjs";
import { WebUSBDriver } from "./WebUSBDriver"
import { DriverType } from "../../../base/DriverType";

class TestWebUSBDriver extends WebUSBDriver {
  readonly type = DriverType.DummyDriver

  static readonly deviceFilters = [
    {vendorId: 0x1234, productId: 0x5678}
  ]
  subject = new Subject<Uint8Array>()
  data = this.subject.asObservable()

  write = jest.fn(() => Promise.resolve())
}

describe("WebUSBDriver", () => {
  describe("constructor", () => {
    test("validates the device against the device filters", () => {
      expect(() => new TestWebUSBDriver({} as USBDevice)).toThrow("USBDevice doesn't match device filters")
      expect(() => new TestWebUSBDriver({vendorId: 0x1234, productId: 0x5678} as USBDevice)).not.toThrow()
    })
  })

  describe("open", () => {
    test("opens the usb device", async () => {
      const usbDevice = {
        open: jest.fn(),
        productId: 0x5678,
        vendorId: 0x1234,
      }
      const driver = new TestWebUSBDriver(usbDevice as unknown as USBDevice)

      await driver.open()
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
      const driver = new TestWebUSBDriver(usbDevice as unknown as USBDevice)

      await driver.close()
      expect(usbDevice.close).toHaveBeenCalled()
    })
  })
})
