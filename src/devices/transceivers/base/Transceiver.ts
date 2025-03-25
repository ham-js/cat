import { AGCAttack } from "./AGCAttack"
import { Device } from "../../base/Device"
import { DeviceType } from "../../base/DeviceType"
import { TransceiverVendor } from "./TransceiverVendor"
import { VFOType } from "./VFOType"

export abstract class Transceiver extends Device {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverVendor

  abstract getVFO(parameter: { vfo: VFOType }): Promise<number>
  abstract setVFO(parameter: { frequency: number, vfo: VFOType }): Promise<void>
  setAGC?(parameter: { attack: AGCAttack }): Promise<void>
}
