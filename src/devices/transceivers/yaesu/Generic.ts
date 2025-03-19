import { z } from "zod";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { TransceiverDevice } from "../base/TransceiverDevice";
import { TransceiverDeviceVendor } from "../base/TransceiverDeviceVendor";
import { filter, firstValueFrom, map } from "rxjs";
import { delimiterParser } from "../../../parsers/delimiterParser";

const vfoType = z.number().int().min(0).max(1)

const AGCAttackNumbers: Record<TransceiverAGCAttack, number> = {
  [TransceiverAGCAttack.Off]: 0,
  [TransceiverAGCAttack.Fast]: 1,
  [TransceiverAGCAttack.Mid]: 2,
  [TransceiverAGCAttack.Slow]: 3,
  [TransceiverAGCAttack.Auto]: 4,
}

export class Generic extends TransceiverDevice {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverDeviceVendor.Yaesu

  readonly _commands = {
    setAGC: Object.assign(
      ({ attack }: { attack: TransceiverAGCAttack }) =>
        this.serialPort.writeString(
          `GT0${AGCAttackNumbers[attack]};`
        ),
      {
        parameterType: z.object({
          attack: z.nativeEnum(TransceiverAGCAttack)
        })
      }
    ),
    setVFO: Object.assign(
      ({ frequency, vfo }: { frequency: number, vfo: number }) =>
        this.serialPort.writeString(
          `F${vfo === 0 ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
        ),
      {
        parameterType: z.object({
          frequency: z
            .number()
            .int()
            .gte(30_000)
            .lte(56_000_000),
          vfo: vfoType
        })
      }),
    getVFO: Object.assign(
      ({ vfo }: { vfo: number }) => {
        const value = firstValueFrom(
          delimiterParser(this.serialPort.stringObservable(), ";")
            .pipe(
              map((command) => parseInt(command.match(new RegExp(`F${vfo === 0 ? 'A' : 'B'}(\\d+);`))?.[1] ?? "", 10)),
              filter(Boolean)
            )
        )

        this.serialPort.writeString(`F${vfo === 0 ? 'A' : 'B'};`) 

        return value
      },
      {
        parameterType: z.object({
          vfo: vfoType
        })
      }
    )
  }
}
