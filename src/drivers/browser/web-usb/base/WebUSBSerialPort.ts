import { SerialPort } from "../../../base/SerialPort"

export abstract class WebUSBSerialPort extends SerialPort {
  static readonly deviceFilters: USBDeviceFilter[] = []

  constructor(protected usbDevice: USBDevice) {
    super()

    this.validateDeviceFilters()
  }

  async open(): Promise<void> {
    await this.usbDevice.open()
  }

  async close(): Promise<void> {
    await this.usbDevice.close()
  }

  protected validateDeviceFilters() {
    const matchesDeviceFilters = !!(this.constructor as typeof WebUSBSerialPort).deviceFilters.find(({ classCode, productId, protocolCode, serialNumber, subclassCode, vendorId }) => {
      const matchesClassCode = typeof classCode === "number" ? classCode === this.usbDevice.deviceClass : true
      const matchesProductId = typeof productId === "number" ? productId === this.usbDevice.productId : true
      const matchesProtocolCode = typeof protocolCode === "number" ? vendorId === this.usbDevice.deviceProtocol : true
      const matchesSerialNumber = typeof serialNumber === "string" ? classCode === this.usbDevice.serialNumber : true
      const matchesSubclassCode = typeof subclassCode === "number" ? classCode === this.usbDevice.deviceSubclass : true
      const matchesVendor = typeof vendorId === "number" ? vendorId === this.usbDevice.vendorId : true

      return matchesClassCode && matchesProductId && matchesProtocolCode && matchesSerialNumber && matchesSubclassCode && matchesVendor
    })

    if (!matchesDeviceFilters) throw new Error("USBDevice doesn't match device filters")
  }
}
