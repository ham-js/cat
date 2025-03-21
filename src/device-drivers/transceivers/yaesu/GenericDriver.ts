import { z } from "zod";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { TransceiverDriver } from "../base/TransceiverDriver";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { filter, firstValueFrom, map } from "rxjs";
import { delimiterParser } from "../../../parsers/delimiterParser";
import { TransceiverVFOType } from "../base/TransceiverVFOType";
import { TransceiverCommands } from "../base/TransceiverCommands";

const vfoType = z.enum([
  TransceiverVFOType.A,
  TransceiverVFOType.B
])

const AGCAttackNumbers: Record<TransceiverAGCAttack, number> = {
  [TransceiverAGCAttack.Off]: 0,
  [TransceiverAGCAttack.Fast]: 1,
  [TransceiverAGCAttack.Mid]: 2,
  [TransceiverAGCAttack.Slow]: 3,
  [TransceiverAGCAttack.Auto]: 4,
}

export class GenericDriver extends TransceiverDriver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.Yaesu

  readonly _commands = {
    setAGC: Object.assign(
      ({ attack }: Parameters<NonNullable<TransceiverCommands["setAGC"]>>[0]) =>
        this.communicationDriver.writeString(
          `GT0${AGCAttackNumbers[attack]};`
        ),
      {
        parameterType: z.object({
          attack: z.nativeEnum(TransceiverAGCAttack)
        })
      }
    ),
    setVFO: Object.assign(
      ({ frequency, vfo }: Parameters<TransceiverCommands["setVFO"]>[0]) =>
        this.communicationDriver.writeString(
          `F${vfo === TransceiverVFOType.A ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
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
      async ({ vfo }: Parameters<TransceiverCommands["getVFO"]>[0]) => {
        const value = firstValueFrom(
          delimiterParser(this.communicationDriver.stringObservable(), ";")
            .pipe(
              map((command) => parseInt(command.match(new RegExp(`F${vfo === TransceiverVFOType.A ? 'A' : 'B'}(\\d+);`))?.[1] ?? "", 10)),
              filter(Boolean)
            )
        )

        await this.communicationDriver.writeString(`F${vfo === TransceiverVFOType.A ? 'A' : 'B'};`)

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
