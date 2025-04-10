import { AGCAttack } from "./AGCAttack"
import { Device } from "../../base/Device"
import { DeviceType } from "../../base/DeviceType"
import { TransceiverVendor } from "./TransceiverVendor"
import { VFOType } from "./VFOType"
import { merge, Observable, share, Subject, takeUntil } from "rxjs"
import { TransceiverEvent, TransceiverEventType } from "./TransceiverEvent"
import { poll } from "../../base/utils/poll"
import { AntennaTunerState } from "./AntennaTunerState"
import { Direction } from "./Direction"
import { Band } from "./Bands"

export class Transceiver extends Device {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverVendor

  pollingInterval = 500

  protected _closeEvents = new Subject<void>()
  readonly events: Observable<TransceiverEvent> =
    merge(
      poll(async () => ({
        frequency: await this.getVFOFrequency({ vfo: VFOType.Current }),
        type: TransceiverEventType.VFO as const,
        vfo: VFOType.Current
      }), "frequency"),
      poll(async () => ({
        frequency: await this.getVFOFrequency({ vfo: VFOType.Other }),
        type: TransceiverEventType.VFO as const,
        vfo: VFOType.Other
      }), "frequency"),
    ).pipe(
      takeUntil(this._closeEvents),
      share()
    )

  async close() {
    this._closeEvents.next()
    await super.close()
  }

  getVFOFrequency(parameter: { vfo: VFOType }): Promise<number> {
    throw new Error("Not implemented")
  }
  setVFOFrequency(parameter: { frequency: number, vfo: VFOType }): Promise<void> {
    throw new Error("Not implemented")
  }

  copyBandSettings?(parameter: { source: VFOType | "memory", target: VFOType | "memory" }): Promise<void>

  setAGCAttack?(parameter: { attack: AGCAttack }): Promise<void>

  getAutoNotchEnabled?(): Promise<boolean>
  setAutoNotchEnabled?(parameter: { enabled: boolean }): Promise<void>

  getAntennaTunerState?(): Promise<AntennaTunerState>
  setAntennaTunerState?(parameter: { state: AntennaTunerState }): Promise<void>

  // convention: gain is between 0-1 so consumers don't need to map to the
  // supported range of the device themselves
  getAFGain?(): Promise<number>
  setAFGain?(parameter: { gain: number }): Promise<void>

  changeBand?(parameter: { direction: Direction }): Promise<void>

  getBreakInEnabled?(): Promise<boolean>
  setBreakInEnabled?(parameter: { enabled: boolean }): Promise<void>

  getManualNotchEnabled?(): Promise<boolean>
  getManualNotchFrequency?(): Promise<number>
  setManualNotchEnabled?(parameter: { enabled: boolean }): Promise<void>
  setManualNotchFrequency?(parameter: { frequency: number }): Promise<void>

  setBand?(parameter: { band: Band }): Promise<void>

  getRXBusy?(): Promise<boolean>

  getRITEnabled?(): Promise<boolean>
  setRITEnabled?(parameter: { enabled: boolean }): Promise<void>

  getCTCSSFrequency?(): Promise<number>
  setCTCSSFrequency?(parameter: { frequency: number }): Promise<void>
}
