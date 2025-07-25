import { Driver } from "../../../base/Driver"

/**
 *  Drivers for the [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API) supported by chromium based browsers
 */
export abstract class WebUSBDriver extends Driver {
  /**
   *  The device filters supported by this driver. Can be handed directly to
   *  [requestDevice](https://developer.mozilla.org/en-US/docs/Web/API/USB/requestDevice)
   *  in order to only show supported devices.
   */
  static readonly deviceFilters: USBDeviceFilter[] = []

  constructor(protected usbDevice: USBDevice) {
    super()

    this.validateDeviceFilters()
  }

  get isOpen(): boolean {
    return this.usbDevice.opened
  }

  async open(): Promise<void> {
    await this.usbDevice.open()
  }

  async close(): Promise<void> {
    await this.usbDevice.close()
  }

  protected validateDeviceFilters() {
    const matchesDeviceFilters = !!(this.constructor as typeof WebUSBDriver).deviceFilters.find(({ classCode, productId, protocolCode, serialNumber, subclassCode, vendorId }) => {
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
