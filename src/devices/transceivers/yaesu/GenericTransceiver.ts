import { z } from "zod";

import { VFOType } from "devices/transceivers/base/VFOType";
import { AGCAttack } from "devices/transceivers/base/AGCAttack";
import { Transceiver } from "devices/transceivers/base/Transceiver";
import { TransceiverVendor } from "devices/transceivers/base/TransceiverVendor";
import { filter, firstValueFrom, map } from "rxjs";
import { delimiterParser } from "devices/base/parsers/delimiterParser";
import { command } from "devices/base/decorators/command";

const vfoType = z.enum([
  VFOType.A,
  VFOType.B
])

const AGCAttackNumbers: Record<AGCAttack, number> = {
  [AGCAttack.Off]: 0,
  [AGCAttack.Fast]: 1,
  [AGCAttack.Mid]: 2,
  [AGCAttack.Slow]: 3,
  [AGCAttack.Auto]: 4,
}

export class GenericTransceiver extends Transceiver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.Yaesu

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
      .lte(56_000_000),
    vfo: vfoType
  })
  async setVFO({ frequency, vfo }: { frequency: number; vfo: VFOType; }): Promise<void> {
    await this.driver.writeString(
      `F${vfo === VFOType.A ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
    )
  }

  @command({
    attack: z.nativeEnum(AGCAttack)
  })
  async setAGC({ attack }: { attack: AGCAttack; }): Promise<void> {
    await this.driver.writeString(
      `GT0${AGCAttackNumbers[attack]};`
    )
  }
} 
