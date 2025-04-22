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
import { Direction } from "../base/Direction";
import { Band } from "../base/Bands";
import { ExtractMapKey } from "../../../utils/types/ExtractMapKey";

const StringToCTCSSFrequencyMap = new Map([
["00", 67.0],
["01", 69.3],
["02", 71.9],
["03", 74.4],
["04", 77.0],
["05", 79.7],
["06", 82.5],
["07", 85.4],
["08", 88.5],
["09", 91.5],
["10", 94.8],
["11", 97.4],
["12", 100.0],
["13", 103.5],
["14", 107.2],
["15", 110.9],
["16", 114.8],
["17", 118.8],
["18", 123.0],
["19", 127.3],
["20", 131.8],
["21", 136.5],
["22", 141.3],
["23", 146.2],
["24", 151.4],
["25", 156.7],
["26", 159.8],
["27", 162.2],
["28", 165.5],
["29", 167.9],
["30", 171.3],
["31", 173.8],
["32", 177.3],
["33", 179.9],
["34", 183.5],
["35", 186.2],
["36", 189.9],
["37", 192.8],
["38", 196.6],
["39", 199.5], 
["40", 203.5], 
["41", 206.5], 
["42", 210.7], 
["43", 218.1], 
["44", 225.7], 
["45", 229.1], 
["46", 233.6], 
["47", 241.8], 
["48", 250.3], 
["49", 254.1], 
] as const)

const vfoType = z.enum([
  VFOType.Current,
  VFOType.Other
])

const BandSelectMap: Record<Exclude<Band, "10km">, string> = {
  "160m": "00",
  "80m": "01",
  "40m": "02",
  "30m": "03",
  "20m": "04",
  "17m": "05",
  "15m": "06",
  "13m": "07",
  "10m": "08",
  "6m": "09",
  "General": "10",
}

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

  @command({
    band: z.enum([
      "160m",
      "80m",
      "40m",
      "30m",
      "20m",
      "17m",
      "15m",
      "13m",
      "10m",
      "6m",
      "General",
    ])
  })
  async setBand({ band }: { band: Exclude<Band, "10km">; }): Promise<void> {
    await this.driver.writeString(`BU0${BandSelectMap[band]};`) 
  }

  @command()
  getTXBusy(): Promise<boolean> {
    return this.readResponse("BY;", this.parseTXBusyResponse) 
  }

  protected parseTXBusyResponse(response: string): null | boolean {
    return response.match(/^BY(0|1);$/) && response === "BY1;"
  }

  @command()
  getRITEnabled(): Promise<boolean> {
    return this.readResponse("RT;", this.parseRITEnabledResponse)
  }

  protected parseRITEnabledResponse(response: string): boolean | null {
    return response.match(/^RT(0|1);$/) && response === "RT1;"
  }

  @command({
    enabled: z
      .boolean()
  })
  async setRITEnabled({ enabled }: { enabled: boolean; }): Promise<void> {
    await this.driver.writeString(enabled ? "RT1;" : "RT0;")
  }

  @command()
  getCTCSSFrequency(): Promise<number> {
    return this.readResponse("CN;", this.parseCTCSSFrequencyResponse)
  }

  protected parseCTCSSFrequencyResponse(response: string): number | undefined {
    const ctcssMatch = response.match(/^CN(\d{2});$/)

    if (!ctcssMatch) return

    return StringToCTCSSFrequencyMap.get(ctcssMatch[1] as ExtractMapKey<typeof StringToCTCSSFrequencyMap>)
  }

  @command()
  getAFGain(): Promise<number> {
    return this.readResponse("AG;", this.parseAFGainResponse)
  }

  protected parseAFGainResponse(response: string): number | null {
    const gainMatch = response.match(/^AG(\d{3});$/)
    if (!gainMatch) return null

    return parseInt(gainMatch[1], 10) / 255
  }

  @command({
    gain: z
      .number()
      .min(0)
      .max(1)
  })
  async setAFGain({ gain }: { gain: number; }): Promise<void> {
    await this.driver.writeString(`AG${Math.round(gain * 255).toString().padStart(3, "0")};`)
  }

  @command({
    direction: z
      .nativeEnum(Direction)
  })
  async changeBand({ direction }: { direction: Direction; }): Promise<void> {
    await this.driver.writeString(direction === Direction.Up ? "BU;" : "BD;")
  }

  @command()
  getBreakInEnabled(): Promise<boolean> {
    return this.readResponse("BI;", this.parseBreakInResponse)
  }

  protected parseBreakInResponse(response: string): boolean | null {
    return response.match(/^BI(0|1);$/) && response === "BI1;"
  }

  @command({
    enabled: z
      .boolean()
  })
  async setBreakInEnabled({ enabled }: { enabled: boolean }): Promise<void> {
    await this.driver.writeString(`BI${enabled ? "1" : "0"};`)
  }

  @command()
  getManualNotchEnabled(): Promise<boolean> {
    return this.readResponse("NT;", this.parseManualNotchEnabledResponse) 
  }

  protected parseManualNotchEnabledResponse(response: string): boolean | null {
    return response.match(/^NT(0|1);$/) && response === "NT1;"
  }

  @command()
  getManualNotchFrequencyOffset(): Promise<number> {
    return this.readResponse("BP;", this.parseManualNotchFrequencyResponse)
  }

  protected parseManualNotchFrequencyResponse(response: string): number | null {
    const valueMatch = response.match(/^BP(\d{3});$/)
    if (!valueMatch) return null

    return parseInt(valueMatch[1], 10) / 255
  }

  @command({
    frequencyOffset: z
      .number()
      .min(0)
      .max(1)
  })
  async setManualNotchFrequencyOffset({ frequencyOffset }: { frequencyOffset: number }): Promise<void> {
    await this.driver.writeString(`BP${(Math.round(frequencyOffset * 255)).toString().padStart(3, "0")};`)
  }

  @command({
    enabled: z
      .boolean()
  })
  async setManualNotchEnabled({ enabled }: { enabled: boolean; }): Promise<void> {
    await this.driver.writeString(enabled ? "NT1;" : "NT0;")
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
