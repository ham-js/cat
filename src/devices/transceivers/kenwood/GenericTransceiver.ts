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

const AGCAttackNumbers: Record<AGCAttack.Off | AGCAttack.Slow | AGCAttack.Mid | AGCAttack.Fast | "on", number> = {
  [AGCAttack.Off]: 0,
  [AGCAttack.Slow]: 1,
  [AGCAttack.Mid]: 2,
  [AGCAttack.Fast]: 3,
  on: 4
}

@supportedDrivers([
  ...DeviceAgnosticDriverTypes
])
export class GenericTransceiver extends Transceiver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.Kenwood

  @command()
  getAntennaTunerState(): Promise<{ rx: boolean, tx: boolean, tuning: boolean }> {
    return this.readResponse("AC;", this.parseAntennaTunerState)
  }

  protected parseAntennaTunerState(response: string): { rx: boolean, tx: boolean, tuning: boolean } | null {
    const stateMatch = response.match(/^AC(?<rxString>0|1)(?<txString>0|1)(?<tuningString>0|1);$/)
    if (!stateMatch?.groups) return null

    return {
      rx: stateMatch.groups.rxString === "1",
      tx: stateMatch.groups.txString === "1",
      tuning: stateMatch.groups.tuningString === "1"
    }
  }

  @command({
    source: z.enum([
      VFOType.Current
    ]),
    target: z.enum([
      VFOType.Other
    ])
  })
  async copyBandSettings(_: { source: VFOType, target: VFOType }): Promise<void> {
    await this.driver.writeString("VV;")
  }

  @command({
    vfo: vfoType
  })
  async getVFOFrequency({ vfo }: { vfo: VFOType }): Promise<number> {
    const responseRegex = new RegExp(`^F${vfo === VFOType.Current ? 'A' : 'B'}(\\d+);$`)
    const response = await this.readResponse(`F${vfo === VFOType.Current ? 'A' : 'B'};`, (value) => value.match(responseRegex))

    return parseInt(response[1], 10)
  }

  @command({
    frequency: z
      .number()
      .int()
      .gte(30_000)
      .lte(74_800_000),
    vfo: vfoType
  })
  async setVFOFrequency({ frequency, vfo }: { frequency: number; vfo: VFOType; }): Promise<void> {
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
      "on"
    ])
  })
  async setAGCAttack({ attack }: { attack: AGCAttack | "on" }): Promise<void> {
    await this.driver.writeString(
      `GC0${AGCAttackNumbers[attack as keyof typeof AGCAttackNumbers]};`
    )
  }
}
