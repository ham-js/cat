import { describe, expect, jest, test } from "@jest/globals"

import { CP210xDriver } from "./CP210xDriver"
import { firstValueFrom } from "rxjs"

describe("CP210xDriver", () => {
  describe("observable", () => {
    test("it reads data from the usb device", async () => {
      const data = new DataView(new ArrayBuffer(2))
      data.setUint8(0, 0xFE)
      data.setUint8(1, 0xFE)

      const usbDevice = {
        productId: 0xEA60,
        transferIn: jest.fn(() => new Promise((resolve) => resolve({ data }))),
        vendorId: 0x10C4
      }

      const cp210x = new CP210xDriver(usbDevice as unknown as USBDevice, {baudRate: 9600})

      await expect(firstValueFrom(cp210x.observable)).resolves.toEqual(new Uint8Array([0xFE, 0xFE]))
    })

    test("it completes upon error", async () => {
      const usbDevice = {
        productId: 0xEA60,
        transferIn: jest.fn(() => Promise.reject(new Error("The transfer was cancelled"))),
        vendorId: 0x10C4
      }

      const cp210x = new CP210xDriver(usbDevice as unknown as USBDevice, {baudRate: 9600})

      await expect(firstValueFrom(cp210x.observable)).rejects.toBeTruthy()
    })
  })

  describe("write", () => {
    test("it writes data to the usb device", async () => {
      const usbDevice = {
        productId: 0xEA60,
        transferOut: jest.fn(),
        vendorId: 0x10C4
      }

      const cp210x = new CP210xDriver(usbDevice as unknown as USBDevice, {baudRate: 9600})

      const data = new Uint8Array([0xFE, 0xFE, 0x01, 0xFD])
      cp210x.write(data)

      expect(usbDevice.transferOut).toHaveBeenCalledWith(1, data)
    })
  })

  describe("open", () => {
    test("initializes the usb device", async () => {
      const usbDevice = {
        claimInterface: jest.fn(),
        controlTransferOut: jest.fn(),
        open: jest.fn(),
        productId: 0xEA60,
        selectConfiguration: jest.fn(() =>
          usbDevice["configuration"] = {
            interfaces: [{
              interfaceNumber: 1234
            }]
          }
        ),
        vendorId: 0x10C4
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const cp210x = new CP210xDriver(usbDevice as unknown as USBDevice, {baudRate: 9600})
      await cp210x.open()

      const openOrder = usbDevice.open.mock.invocationCallOrder[0]
      const selectConfigurationOrder = usbDevice.selectConfiguration.mock.invocationCallOrder[0]
      const claimInterfaceOrder = usbDevice.claimInterface.mock.invocationCallOrder[0]

      expect(openOrder).toBeLessThan(selectConfigurationOrder)
      expect(selectConfigurationOrder).toBeLessThan(claimInterfaceOrder)

      expect(usbDevice.controlTransferOut.mock.calls[0]).toEqual([{ // enable chip
        requestType: 'vendor',
        recipient: 'device',
        request: 0x00,
        index: 0,
        value: 1,
      }])
      expect(usbDevice.controlTransferOut.mock.calls[1]).toEqual([{ // set baud rate
        requestType: 'vendor',
        recipient: 'device',
        request: 0x1E,
        index: 0,
        value: 0,
      }, new Uint32Array([9600])])
      expect(usbDevice.controlTransferOut.mock.calls[2]).toEqual([{ // set DTR/RTS
        requestType: 'vendor',
        recipient: 'device',
        request: 0x07,
        index: 0,
        value: 0b1100000011,
      }])
    })
  })
})
