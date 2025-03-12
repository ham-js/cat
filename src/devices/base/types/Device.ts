import { DeviceType } from "../enums/DeviceType"
import { CommandFactory } from "./CommandFactory"

export interface Device {
  deviceName: string // the name of the device
  deviceType: DeviceType // the type of the device
  deviceVendor: string // the name of the vendor
  commands: Record<string, Pick<CommandFactory<object | void>, 'parameterType'>> // the commands we can create for the device; however since devices are abstract we can only query parameter types, we cannot call commands, because we cannot know their parameters at build time
}
