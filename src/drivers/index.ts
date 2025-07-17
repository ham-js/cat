import { DriverType } from "./base/DriverType"
import { CP210xWebUSBDriver } from "./browser/web-usb/CP210xWebUSBDriver"
import { WebSerialDriver } from "./browser/WebSerialDriver"
import { DummyDriver } from "./DummyDriver"
import { SerialPortDriver } from "./node/SerialPortDriver"
import { WebSocketDriver } from "./WebSocketDriver"

export { Driver } from "./base/Driver"
export { DriverType } from "./base/DriverType"
export { DriverLog, LogDriver } from "./LogDriver"
export { WebUSBDriver } from "./browser/web-usb/base/WebUSBDriver"

export const BrowserDriverTypes = [
  DriverType.CP210xWebUSBDriver,
  DriverType.WebSerialDriver
] as const

export const NodeDriverTypes = [
  DriverType.SerialPortDriver,
] as const

export const DeviceAgnosticDriverTypes = [
  DriverType.DummyDriver,
  DriverType.SerialPortDriver,
  DriverType.WebSerialDriver,
  DriverType.WebSocketDriver
]

export {
  CP210xWebUSBDriver,
  DummyDriver,
  SerialPortDriver,
  WebSerialDriver,
  WebSocketDriver
}
