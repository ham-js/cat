import { DeviceType } from "../../../base/enums/DeviceType"
import { CommandFactory } from "../../../base/types/CommandFactory"
import { Device } from "../../../base/types/Device"
import { TransceiverAGCAttack } from "../enums/TransceiverAGCAttack"
import { TransceiverDeviceVendor } from "../enums/TransceiverDeviceVendor"

type TransceiverCommandFactories = {
  getVFO: CommandFactory<{ vfo: number }>
  setAGC?: CommandFactory<{ attack: TransceiverAGCAttack }>
  setVFO: CommandFactory<{ frequency: number; vfo: number }>
}

/**
 * A transceiver device is a device with a `deviceType` `DeviceType.Transceiver`
 * and with a `vendor` of `TransceiverDeviceVendor`.  There is a common subset
 * of command factories every transceiver can implement. Some command factories
 * are mandatory as they define what makes a transceiver (such as setting and
 * getting the VFO frequency).
 */
export abstract class TransceiverDevice extends Device<TransceiverCommandFactories> {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverDeviceVendor
}
