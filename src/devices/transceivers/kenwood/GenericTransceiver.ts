import { z } from "zod";
import { filter, firstValueFrom, map } from "rxjs";

import { AGCAttack } from "devices/transceivers/base/AGCAttack";
import { VFOType } from "devices/transceivers/base/VFOType";
import { Transceiver } from "devices/transceivers/base/Transceiver";
import { TransceiverVendor } from "devices/transceivers/base/TransceiverVendor";
import { delimiterParser } from "devices/base/parsers/delimiterParser";
import { command } from "devices/base/decorators/command";

const vfoType = z.enum([
  VFOType.A,
  VFOType.B
])

const AGCAttackNumbers: Record<AGCAttack.Off | AGCAttack.Slow | AGCAttack.Mid | AGCAttack.Fast, number> = {
  [AGCAttack.Off]: 0,
  [AGCAttack.Slow]: 1,
  [AGCAttack.Mid]: 2,
  [AGCAttack.Fast]: 3,
}

export class GenericTransceiver extends Transceiver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.Kenwood

  @command({
    vfo: vfoType
  })
  async getVFO({ vfo }: { vfo: VFOType }): Promise<number> {
    const value = firstValueFrom(
      delimiterParser(this.driver.stringObservable(), ";")
        .pipe(
          map((command) => parseInt(command.match(new RegExp(`F${vfo === VFOType.A ? 'A' : 'B'}(\\d+);`))?.[1] ?? "", 10)),
          filter(Boolean)
        )
    )

    await this.driver.writeString(`F${vfo === VFOType.A ? 'A' : 'B'};`)

    return value
  }

  @command({
    frequency: z
      .number()
      .int()
      .gte(30_000)
      .lte(74_800_000),
    vfo: vfoType
  })
  async setVFO({ frequency, vfo }: { frequency: number; vfo: VFOType; }): Promise<void> {
    await this.driver.writeString(
      `F${vfo === VFOType.A ? 'A' : 'B'}${frequency.toString(10).padStart(11, '0')};`
    )
  }

  @command({
    attack: z.enum([
      AGCAttack.Off,
      AGCAttack.Slow,
      AGCAttack.Mid,
      AGCAttack.Fast,
    ])
  })
  async setAGC({ attack }: { attack: AGCAttack; }): Promise<void> {
    await this.driver.writeString(
      `GC0${AGCAttackNumbers[attack as keyof typeof AGCAttackNumbers]};`
    )
  }
}
