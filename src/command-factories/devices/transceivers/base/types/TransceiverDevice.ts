import { DeviceType } from "../../../base/enums/DeviceType"
import { Device } from "../../../base/types/Device"
import { CommandFactory } from "../../../types/CommandFactory"

// this type defines commands all transceivers need to implement. It is a generic interface to transceivers. Concrete implementations can have more yet optional keys in the params object
type Commands = {
  setVFO: CommandFactory<{ frequency: number, vfo: number }> // vfo is number based, although some vendors call it A/B
}

export interface TransceiverDevice extends Device {
  commands: Commands
  deviceType: DeviceType.Transceiver
}
