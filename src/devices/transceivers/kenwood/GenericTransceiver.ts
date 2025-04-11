import { z } from "zod";
import { command } from "../../base/decorators/command";
import { supportedDrivers } from "../../base/decorators/supportedDrivers";
import { AGCAttack } from "../base/AGCAttack";
import { Transceiver } from "../base/Transceiver";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { DeviceAgnosticDriverTypes } from "../../../drivers";
import { AntennaTunerState } from "../base/AntennaTunerState";
import { AGCState } from "../base/AGCState";

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
  getAFGain(): Promise<number> {
    return this.readResponse("AG;", this.parseAFGainResponse)
  }

  protected parseAFGainResponse(response: string): number | null {
    const gainMatch = response.match(/^AG(\d{3});$/)
    if (!gainMatch) return null

    return parseInt(gainMatch[1], 10) / 255
  }

  @command()
  getAntennaTunerState({ rx } = { rx: false }): Promise<AntennaTunerState> {
    return this.readResponse("AC;", (response) => this.parseAntennaTunerStateResponse(response, rx))
  }

  protected parseAntennaTunerStateResponse(response: string, rx = false): AntennaTunerState | null {
    const stateMatch = response.match(/^AC(?<rxString>0|1)(?<txString>0|1)(?<tuningString>0|1);$/)
    if (!stateMatch?.groups) return null

    const rxEnabled = stateMatch.groups.rxString === "1"
    const txEnabled = stateMatch.groups.txString === "1"
    const tuningEnabled = stateMatch.groups.tuningString === "1"

    if (tuningEnabled) return AntennaTunerState.Tuning
    if (rx) return rxEnabled ? AntennaTunerState.On : AntennaTunerState.Off

    return txEnabled ? AntennaTunerState.On : AntennaTunerState.Off
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

  @command()
  getAGCState(): Promise<AGCState> {
    return this.readResponse("GC;", (response) => {
      const attack = this.parseAGCAttackResponse(response)

      if (!attack) return

      return {
        auto: false,
        attack
      }
    })
  }

  protected parseAGCAttackResponse(response: string): AGCAttack | undefined {
    const attackMatch = response.match(/^GC([0-3]);$/)?.[1]

    if (!attackMatch) return

    if (attackMatch === "1") return AGCAttack.Slow
    if (attackMatch === "2") return AGCAttack.Mid
    if (attackMatch === "3") return AGCAttack.Fast

    return AGCAttack.Off
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
      `GC${AGCAttackNumbers[attack as keyof typeof AGCAttackNumbers]};`
    )
  }
}
