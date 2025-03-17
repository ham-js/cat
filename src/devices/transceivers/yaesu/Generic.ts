import { z } from "zod";
import { TransceiverAGCAttack } from "../base/enums/TransceiverAGCAttack";
import { TransceiverDevice } from "../base/types/TransceiverDevice";
import { TransceiverDeviceVendor } from "../base/enums/TransceiverDeviceVendor";

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

  readonly _commandFactories = {
    setAGC: Object.assign(
      ({ attack }: { attack: TransceiverAGCAttack }) => `GT0${AGCAttackNumbers[attack]};`,
      { parameterType: z.object({ attack: z.nativeEnum(TransceiverAGCAttack) })}
    ),
    setVFO: Object.assign(
      ({ frequency, vfo }: { frequency: number, vfo: number }) => `F${vfo === 0 ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`,
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
      ({ vfo }: { vfo: number }) => `F${vfo === 0 ? 'A' : 'B'};`,
      { parameterType: z.object({ vfo: vfoType }) }
    )
  }
}
