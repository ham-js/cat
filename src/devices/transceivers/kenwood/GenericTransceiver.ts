import { z } from "zod";
import { filter, firstValueFrom, map } from "rxjs";
import { command } from "../../base/decorators/command";
import { supportedDrivers } from "../../base/decorators/supportedDrivers";
import { delimiterParser } from "../../base/parsers/delimiterParser";
import { AGCAttack } from "../base/AGCAttack";
import { Transceiver } from "../base/Transceiver";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { DeviceAgnosticDriverTypes } from "../../../drivers";

const vfoType = z.enum([
  VFOType.Current,
  VFOType.Other
])

const AGCAttackNumbers: Record<AGCAttack.Off | AGCAttack.Slow | AGCAttack.Mid | AGCAttack.Fast, number> = {
  [AGCAttack.Off]: 0,
  [AGCAttack.Slow]: 1,
  [AGCAttack.Mid]: 2,
  [AGCAttack.Fast]: 3,
}

@supportedDrivers([
  ...DeviceAgnosticDriverTypes
])
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
          map((command) => parseInt(command.match(new RegExp(`F${vfo === VFOType.Current ? 'A' : 'B'}(\\d+);`))?.[1] ?? "", 10)),
          filter(Boolean)
        )
    )

    await this.driver.writeString(`F${vfo === VFOType.Current ? 'A' : 'B'};`)

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
      `F${vfo === VFOType.Current ? 'A' : 'B'}${frequency.toString(10).padStart(11, '0')};`
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
