import { AGCAttack } from "./AGCAttack"
import { Device } from "../../base/Device"
import { DeviceType } from "../../base/DeviceType"
import { TransceiverVendor } from "./TransceiverVendor"
import { VFOType } from "./VFOType"
import { merge, Observable, share, Subject, takeUntil } from "rxjs"
import { TransceiverEvent, TransceiverEventType } from "./TransceiverEvent"
import { poll } from "../../base/utils/poll"

export class Transceiver extends Device {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverVendor

  pollingInterval = 500

  protected _closeEvents = new Subject<void>()
  readonly events: Observable<TransceiverEvent> =
    merge(
      poll(async () => ({
        frequency: await this.getVFO({ vfo: VFOType.Current }),
        type: TransceiverEventType.VFO,
        vfo: VFOType.Current
      }), "frequency"),
      poll(async () => ({
        frequency: await this.getVFO({ vfo: VFOType.Other }),
        type: TransceiverEventType.VFO,
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

  setAGC?(parameter: { attack: AGCAttack }): Promise<void>
}
