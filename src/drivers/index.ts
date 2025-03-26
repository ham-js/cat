import { DriverType } from "./base/DriverType"
import { CP210xWebUSBDriver } from "./browser/web-usb/CP210xWebUSBDriver"
import { DummyDriver } from "./DummyDriver"
import { SerialPortDriver } from "./node/SerialPortDriver"
import { WebSocketDriver } from "./WebSocketDriver"

export { Driver } from "./base/Driver"
export { DriverType } from "./base/DriverType"
export { DriverLog } from "./LogDriver"

export const BrowserDriverTypes = [
  DriverType.CP210xWebUSBDriver
] as const

export const NodeDriverTypes = [
  DriverType.SerialPortDriver,
] as const

export const PlatformAgnosticDriverTypes = [
  DriverType.DummyDriver,
  DriverType.WebSocketDriver
] as const

export const DriverTypes = [
  ...BrowserDriverTypes,
  ...NodeDriverTypes,
  ...PlatformAgnosticDriverTypes
] as const

export {
  CP210xWebUSBDriver,
  DummyDriver,
  SerialPortDriver,
  WebSocketDriver
}
