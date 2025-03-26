import { AGCAttack } from "./AGCAttack"
import { Device } from "../../base/Device"
import { DeviceType } from "../../base/DeviceType"
import { TransceiverVendor } from "./TransceiverVendor"
import { VFOType } from "./VFOType"

export class Transceiver extends Device {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverVendor

  getVFO(parameter: { vfo: VFOType }): Promise<number> {
    throw new Error("Not implemented")
  }

  setVFO(parameter: { frequency: number, vfo: VFOType }): Promise<void> {
    throw new Error("Not implemented")
  }

  setAGC?(parameter: { attack: AGCAttack }): Promise<void>
}
