import { DeviceType } from "../../../base/enums/DeviceType"
import { CommandFactory } from "../../../base/types/CommandFactory"
import { Device } from "../../../base/types/Device"
import { TransceiverDeviceVendor } from "./TransceiverDeviceVendor"

export enum AGCLevel {
  Off = 'Off',
  Slow = 'Slow',
  Mid = 'Mid',
  Fast = 'Fast'
}

export abstract class TransceiverDevice extends Device {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverDeviceVendor

  abstract _commands: {
    getVFO: CommandFactory<{ vfo: number }>
    setAGC?: CommandFactory<{ level: AGCLevel }>
    setVFO: CommandFactory<{ frequency: number; vfo: number }>
  }
}
