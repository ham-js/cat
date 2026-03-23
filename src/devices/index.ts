import { Device } from "./base/Device"
import { DeviceEvent } from "./base/DeviceEvent"
import { DeviceLog } from "./base/DeviceLog"
import { DeviceType } from "./base/DeviceType"
import { DeviceManufacturer } from "./base/DeviceManufacturer"
import { Transceivers } from "./transceivers"

export * from "./transceivers"

export const Devices: typeof Device[] = [
  ...Transceivers
]

export {
  Device,
  DeviceEvent,
  DeviceLog,
  DeviceType,
  DeviceManufacturer
}
