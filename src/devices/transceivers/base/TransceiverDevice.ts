import { DeviceType } from "../../base/DeviceType"
import { Command } from "../../base/Command"
import { Device } from "../../base/Device"
import { TransceiverAGCAttack } from "./TransceiverAGCAttack"
import { TransceiverDeviceVendor } from "./TransceiverDeviceVendor"

type TransceiverCommands = {
  getVFO: Command<{ vfo: number }, number>
  setAGC?: Command<{ attack: TransceiverAGCAttack }, void>
  setVFO: Command<{ frequency: number; vfo: number }, void>
}

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
