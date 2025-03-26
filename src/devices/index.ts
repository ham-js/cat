import { Device, DeviceLog } from "./base/Device"
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
