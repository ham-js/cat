import { DeviceType } from "../../base/DeviceType"
import { Device } from "../../base/Device"
import { TransceiverDeviceVendor } from "./TransceiverDeviceVendor"
import { TransceiverCommands } from "./TransceiverCommands"

/**
 * A transceiver device is a device with a `deviceType` `DeviceType.Transceiver`
 * and with a `vendor` of `TransceiverDeviceVendor`.  There is a common subset
 * of commands every transceiver can implement. Some commands are mandatory as
 * they define what makes a transceiver (such as setting and getting the VFO
 * frequency).
 */
export abstract class TransceiverDevice extends Device<TransceiverCommands> {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverDeviceVendor
}
