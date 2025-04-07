import { Device } from "./base/Device"
import { DeviceLog } from "./base/DeviceLog"
import { DeviceType } from "./base/DeviceType"
import { DeviceVendor } from "./base/DeviceVendor"
import { Transceivers } from "./transceivers"

export * from "./transceivers"

export const Devices: typeof Device[] = [
  ...Transceivers
]

export {
  Device,
  DeviceLog,
  DeviceType,
  DeviceVendor
}
