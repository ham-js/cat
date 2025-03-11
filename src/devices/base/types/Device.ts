import { DeviceType } from "../enums/DeviceType"
import { CommandFactory } from "./CommandFactory"

export interface Device {
  deviceName: string // the name of the device
  deviceType: DeviceType // the type of the device
  deviceVendor: string // the name of the vendor
  commands: Record<string, CommandFactory<any>> // the commands we can create for the device
}
