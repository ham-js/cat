import { AGCAttack } from "./AGCAttack"
import { Device } from "../../base/Device"
import { DeviceType } from "../../base/DeviceType"
import { TransceiverVendor } from "./TransceiverVendor"
import { VFOType } from "./VFOType"
import { merge, Observable, share, Subject, takeUntil } from "rxjs"
import { TransceiverEvent, TransceiverEventType } from "./TransceiverEvent"
import { poll } from "../../base/utils/poll"
import { AntennaTunerState } from "./AntennaTunerState"
import { BandDirection } from "./BandDirection"

export class Transceiver extends Device {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverVendor

  pollingInterval = 500

  protected _closeEvents = new Subject<void>()
  readonly events: Observable<TransceiverEvent> =
    merge(
      poll(async () => ({
        frequency: await this.getVFO({ vfo: VFOType.Current }),
        type: TransceiverEventType.VFO as const,
        vfo: VFOType.Current
      }), "frequency"),
      poll(async () => ({
        frequency: await this.getVFO({ vfo: VFOType.Other }),
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

  getVFO(parameter: { vfo: VFOType }): Promise<number> {
    throw new Error("Not implemented")
  }
  setVFO(parameter: { frequency: number, vfo: VFOType }): Promise<void> {
    throw new Error("Not implemented")
  }

  copyBandSettings?(parameter: { source: VFOType | "memory", target: VFOType | "memory" }): Promise<void>

  setAGC?(parameter: { attack: AGCAttack }): Promise<void>

  getAutoNotch?(): Promise<boolean>
  setAutoNotch?(parameter: { enabled: boolean }): Promise<void>

  getAntennaTuner?(): Promise<AntennaTunerState>
  setAntennaTuner?(parameter: { state: AntennaTunerState }): Promise<void>

  // convention: gain is between 0-1 so consumers don't need to map to the
  // supported range of the device themselves
  getAFGain?(): Promise<number>
  setAFGain?(parameter: { gain: number }): Promise<void>

  changeBand?(parameter: { direction: BandDirection }): Promise<void>

  getBreakIn?(): Promise<boolean>
  setBreakIn?(parameter: { enabled: boolean }): Promise<void>

  getManualNotch?(): Promise<{ enabled: boolean, frequency: number }>
  setManualNotch?(parameter: { enabled?: boolean, frequency?: number }): Promise<void>
}
