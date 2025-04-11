import { defer, share, merge, connect, finalize } from "rxjs";
import { z } from "zod";
import { DeviceAgnosticDriverTypes, DriverType } from "../../../drivers";
import { command } from "../../base/decorators/command";
import { supportedDrivers } from "../../base/decorators/supportedDrivers";
import { delimiterParser } from "../../base/parsers/delimiterParser";
import { AGCAttack } from "../base/AGCAttack";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { TransceiverEventType } from "../base/TransceiverEvent";
import { parseResponse } from "../../base/utils/parseResponse";
import { Direction } from "../base/Direction";
import { Band, Bands } from "../base/Bands";
import { invertMap } from "../../../utils/invertMap";
import { oneOf } from "../../../utils/oneOf";
import { ExtractMapKey } from "../../../utils/types/ExtractMapKey";
import { AntennaTunerState } from "../base/AntennaTunerState";
import { AGCState } from "../base/AGCState";
import { GenericTransceiver as KenwoodGenericTransceiver } from "../kenwood/GenericTransceiver";

const vfoType = z.enum([
  VFOType.Current,
  VFOType.Other
])

const BandSelectMap: Record<Band, string> = {
  "160m": "00",
  "80m": "01",
  "40m": "03",
  "30m": "04",
  "20m": "05",
  "17m": "06",
  "15m": "07",
  "13m": "08",
  "10m": "09",
  "6m": "10",
  "General": "11",
  "10km": "12",
}

const StringToCTCSSFrequencyMap = new Map([
  ["000", 67,],
  ["001", 69.3,],
  ["002", 71.9,],
  ["003", 74.4,],
  ["004", 77,],
  ["005", 79.7,],
  ["006", 82.5,],
  ["007", 85.4,],
  ["008", 88.5,],
  ["009", 91.5,],
  ["010", 94.8,],
  ["011", 97.4,],
  ["012", 100,],
  ["013", 103.5,],
  ["014", 107.2,],
  ["015", 110.9,],
  ["016", 114.8,],
  ["017", 118.8,],
  ["018", 123,],
  ["019", 127.3,],
  ["020", 131.8,],
  ["021", 136.5,],
  ["022", 141.3,],
  ["023", 146.2,],
  ["024", 151.4,],
  ["025", 156.7,],
  ["026", 159.8,],
  ["027", 162.2,],
  ["028", 165.5,],
  ["029", 167.9,],
  ["030", 171.3,],
  ["031", 173.8,],
  ["032", 177.3,],
  ["033", 179.9,],
  ["034", 183.5,],
  ["035", 186.2,],
  ["036", 189.9,],
  ["037", 192.8,],
  ["038", 196.6,],
  ["039", 199.5,],
  ["040", 203.5,],
  ["041", 206.5,],
  ["042", 210.7,],
  ["043", 218.1,],
  ["044", 225.7,],
  ["045", 229.1,],
  ["046", 233.6,],
  ["047", 241.8,],
  ["048", 250.3,],
  ["049", 254.1],
] as const)
const CTCSSFrequencyToStringMap = invertMap(StringToCTCSSFrequencyMap)

const StringToDCSCodeMap = new Map([
  ["000", 0o23,],
  ["001", 0o25,],
  ["002", 0o26,],
  ["003", 0o31,],
  ["004", 0o32,],
  ["005", 0o36,],
  ["006", 0o43,],
  ["007", 0o47,],
  ["008", 0o51,],
  ["009", 0o53,],
  ["010", 0o54,],
  ["011", 0o65,],
  ["012", 0o71,],
  ["013", 0o72,],
  ["014", 0o73,],
  ["015", 0o74,],
  ["016", 0o114,],
  ["017", 0o115,],
  ["018", 0o116,],
  ["019", 0o122,],
  ["020", 0o125,],
  ["021", 0o131,],
  ["022", 0o132,],
  ["023", 0o134,],
  ["024", 0o143,],
  ["025", 0o145,],
  ["026", 0o152,],
  ["027", 0o155,],
  ["028", 0o156,],
  ["029", 0o162,],
  ["030", 0o165,],
  ["031", 0o172,],
  ["032", 0o174,],
  ["033", 0o205,],
  ["034", 0o212,],
  ["035", 0o223,],
  ["036", 0o225,],
  ["037", 0o226,],
  ["038", 0o243,],
  ["039", 0o244,],
  ["040", 0o245,],
  ["041", 0o246,],
  ["042", 0o251,],
  ["043", 0o252,],
  ["044", 0o255,],
  ["045", 0o261,],
  ["046", 0o263,],
  ["047", 0o265,],
  ["048", 0o266,],
  ["049", 0o271,],
  ["050", 0o274,],
  ["051", 0o306,],
  ["052", 0o311,],
  ["053", 0o315,],
  ["054", 0o325,],
  ["055", 0o331,],
  ["056", 0o332,],
  ["057", 0o343,],
  ["058", 0o346,],
  ["059", 0o351,],
  ["060", 0o356,],
  ["061", 0o364,],
  ["062", 0o365,],
  ["063", 0o371,],
  ["064", 0o411,],
  ["065", 0o412,],
  ["066", 0o413,],
  ["067", 0o423,],
  ["068", 0o431,],
  ["069", 0o432,],
  ["070", 0o445,],
  ["071", 0o446,],
  ["072", 0o452,],
  ["073", 0o454,],
  ["074", 0o455,],
  ["075", 0o462,],
  ["076", 0o464,],
  ["077", 0o465,],
  ["078", 0o466,],
  ["079", 0o503,],
  ["080", 0o506,],
  ["081", 0o516,],
  ["082", 0o523,],
  ["083", 0o526,],
  ["084", 0o532,],
  ["085", 0o546,],
  ["086", 0o565,],
  ["087", 0o606,],
  ["088", 0o612,],
  ["089", 0o624,],
  ["090", 0o627,],
  ["091", 0o631,],
  ["092", 0o632,],
  ["093", 0o654,],
  ["094", 0o662,],
  ["095", 0o664,],
  ["096", 0o703,],
  ["097", 0o712,],
  ["098", 0o723,],
  ["099", 0o731,],
  ["100", 0o732,],
  ["101", 0o734,],
  ["102", 0o743,],
  ["103", 0o754,],
] as const)

const DCSCodeToStringMap = invertMap(StringToDCSCodeMap)

@supportedDrivers([
  DriverType.CP210xWebUSBDriver,
  ...DeviceAgnosticDriverTypes
])
export class GenericTransceiver extends KenwoodGenericTransceiver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.Yaesu

  readonly events = defer(() => {
    this.setAutoInformation({ enabled: true })

    return delimiterParser(this.driver.stringData(), ";")
      .pipe(
        connect((response$) => merge(
          parseResponse(
            response$,
            this.parseInformationResponse,
            (informationResponse) => ({ frequency: informationResponse.frequency, type: TransceiverEventType.VFO as const, vfo: VFOType.Current }),
            "frequency"
          ),
          parseResponse(
            response$,
            (response) => this.parseInformationResponse(response, "opposite"),
            (informationResponse) => ({ frequency: informationResponse.frequency, type: TransceiverEventType.VFO as const, vfo: VFOType.Other }),
            "frequency"
          ),
          parseResponse(
            response$,
            this.parseAntennaTunerStateResponse,
            (state) => ({ state, type: TransceiverEventType.AntennaTuner as const }),
            "state"
          ),
          parseResponse(
            response$,
            this.parseAFGainResponse,
            (gain) => ({ gain, type: TransceiverEventType.AFGain as const }),
            "gain"
          ),
          parseResponse(
            response$,
            this.parseAutoNotchResponse,
            (enabled) => ({ enabled, type: TransceiverEventType.AutoNotch as const }),
            "enabled"
          ),
          parseResponse(
            response$,
            this.parseBreakInResponse,
            (enabled) => ({ enabled, type: TransceiverEventType.BreakIn as const }),
            "enabled"
          ),
          parseResponse(
            response$,
            this.parseManualNotchEnabledResponse,
            (enabled) => ({ enabled, type: TransceiverEventType.ManualNotchEnabled as const }),
            "enabled"
          ),
          parseResponse(
            response$,
            this.parseManualNotchFrequencyResponse,
            (frequency) => ({ frequency, type: TransceiverEventType.ManualNotchFrequency as const }),
            "frequency"
          ),
          parseResponse(
            response$,
            this.parseRXBusyResponse,
            (busy) => ({ busy, type: TransceiverEventType.RXBusy as const }),
            "busy"
          ),
          parseResponse(
            response$,
            this.parseRITEnabledResponse,
            (enabled) => ({ enabled, type: TransceiverEventType.RITEnabled as const }),
            "enabled"
          ),
          parseResponse(
            response$,
            this.parseCTCSSFrequencyResponse,
            (frequency) => ({ frequency, type: TransceiverEventType.CTCSSFrequency as const }),
            "frequency"
          ),
          parseResponse(
            response$,
            this.parseDCSCodeResponse,
            (code) => ({ code, type: TransceiverEventType.DCSCode as const }),
            "code"
          ),
          parseResponse(
            response$,
            this.parseAGCStateResponse,
            ({ attack }) => ({ attack, type: TransceiverEventType.AGCAttack as const }),
            "attack"
          ),
          parseResponse(
            response$,
            this.parseAGCStateResponse,
            ({ auto }) => ({ auto, type: TransceiverEventType.AGCAuto as const }),
            "auto"
          ),
        ))
      )
  }).pipe(
    finalize(() => this.setAutoInformation({ enabled: false })),
    share()
  )

  @command({
    enabled: z
      .boolean()
  })
  async setRITEnabled({ enabled }: { enabled: boolean }): Promise<void> {
    await this.driver.writeString(enabled ? "CF010;" : "CF000;")
  }

  @command()
  getRITEnabled(): Promise<boolean> {
    return this.readResponse("CF0;", this.parseRITEnabledResponse)
  }

  protected parseRITEnabledResponse(response: string): boolean | null {
    return response.match(/^CF0(0|1)0;$/) && response === "CF010;"
  }

  @command()
  getRXBusy(): Promise<boolean> {
    return this.readResponse("BY;", this.parseRXBusyResponse)
  }

  protected parseRXBusyResponse(response: string): boolean | null {
    return response.match(/^BY(0|1)0;$/) && response === "BY10;"
  }

  @command({
    band: z.enum(Bands)
  })
  async setBand({ band }: { band: Band; }): Promise<void> {
    await this.driver.writeString(`BS${BandSelectMap[band]};`)
  }

  @command({
    enabled: z
      .boolean()
  })
  async setAutoNotchEnabled({ enabled }: { enabled: boolean }): Promise<void> {
    await this.driver.writeString(enabled ? "BC01;" : "BC00;")
  }

  @command()
  getAutoNotchEnabled(): Promise<boolean> {
    return this.readResponse("BC0;", this.parseAutoNotchResponse)
  }

  protected parseAutoNotchResponse(response: string): boolean | null {
    return response.match(/^BC0(0|1);$/) && response === "BC01;"
  }

  @command()
  getAFGain(): Promise<number> {
    return this.readResponse("AG0;", this.parseAFGainResponse)
  }

  protected parseAFGainResponse(response: string): number | null {
    const gainMatch = response.match(/^AG0(\d{3});$/)
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
    await this.driver.writeString(`AG0${Math.round(gain * 255).toString().padStart(3, "0")};`)
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
      .lte(56_000_000),
    vfo: vfoType
  })
  async setVFOFrequency({ frequency, vfo }: { frequency: number; vfo: VFOType; }): Promise<void> {
    await this.driver.writeString(
      `F${vfo === VFOType.Current ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
    )
  }

  @command()
  getAGCState(): Promise<AGCState> {
    return this.readResponse("GT0;", this.parseAGCStateResponse)
  }

  protected parseAGCStateResponse(response: string): AGCState | null {
    const attackMatch = response.match(/^GT0([0-6]);$/)?.[1]
    if (!attackMatch) return null

    if (attackMatch === "1") return { auto: false, attack: AGCAttack.Fast }
    if (attackMatch === "2") return { auto: false, attack: AGCAttack.Mid }
    if (attackMatch === "3") return { auto: false, attack: AGCAttack.Slow }
    if (attackMatch === "4") return { auto: true, attack: AGCAttack.Fast }
    if (attackMatch === "5") return { auto: true, attack: AGCAttack.Mid }
    if (attackMatch === "6") return { auto: true, attack: AGCAttack.Slow }

    return { auto: false, attack: AGCAttack.Off }
  }

  @command({
    attack: z.nativeEnum(AGCAttack)
  })
  async setAGCAttack({ attack }: { attack: AGCAttack; }): Promise<void> {
    if (attack === AGCAttack.Off) await this.driver.writeString("GT00;")
    else if (attack === AGCAttack.Fast) await this.driver.writeString("GT01;")
    else if (attack === AGCAttack.Mid) await this.driver.writeString("GT02;")
    else if (attack === AGCAttack.Slow) await this.driver.writeString("GT03;")
    else if (attack === AGCAttack.Auto) await this.driver.writeString("GT04;")
  }

  @command({
    state: z
      .nativeEnum(AntennaTunerState)
  })
  async setAntennaTunerState({ state }: { state: AntennaTunerState }): Promise<void> {
    if (state === AntennaTunerState.Tuning) await this.driver.writeString("AC002;")
    else if (state === AntennaTunerState.On) await this.driver.writeString("AC001;")
    else await this.driver.writeString("AC000;")
  }

  @command()
  getAntennaTunerState(): Promise<AntennaTunerState> {
    return this.readResponse("AC;", this.parseAntennaTunerStateResponse)
  }

  protected parseAntennaTunerStateResponse(response: string): AntennaTunerState | null {
    const stateMatch = response.match(/^AC00(\d);$/)
    if (!stateMatch) return null

    if (stateMatch[1] === "1") return AntennaTunerState.On
    if (stateMatch[1] === "2") return AntennaTunerState.Tuning

    return AntennaTunerState.Off
  }

  @command({
    source: z
      .enum([
        VFOType.Current,
        VFOType.Other,
        "memory"
      ]),
    target: z
      .enum([
        VFOType.Current,
        VFOType.Other,
        "memory"
      ]),
  })
  async copyBandSettings({ source, target }: { source: VFOType | "memory", target: VFOType | "memory" }): Promise<void> {
    if (source === target) return

    if (source === VFOType.Current) {
      if (target === VFOType.Other) {
        await this.driver.writeString("AB;")
      } else if (target === "memory") {
        await this.driver.writeString("AM;")
      }
    } else if (source === VFOType.Other) {
      if (target === VFOType.Current) {
        await this.driver.writeString("BA;")
      }
    }
  }

  @command({
    enabled: z
      .boolean()
  })
  async setAutoInformation({ enabled }: { enabled: boolean }): Promise<void> {
    await this.driver.writeString(`AI${enabled ? "1" : "0"};`)
  }

  @command()
  getAutoInformation(): Promise<boolean> {
    return this.readResponse("AI;", (response) => response.match(/^AI(0|1);$/) && response === "AI1;")
  }

  @command()
  getDCSCode(): Promise<number> {
    return this.readResponse("CN01;", this.parseDCSCodeResponse)
  }

  protected parseDCSCodeResponse(response: string): number | undefined {
    const dcsMatch = response.match(/^CN01(\d{3});$/)

    if (!dcsMatch) return

    return StringToDCSCodeMap.get(dcsMatch[1] as ExtractMapKey<typeof StringToDCSCodeMap>)
  }

  @command({
    code: oneOf(
      Array.from(DCSCodeToStringMap.keys())
    )
  })
  async setDCSCode({ code }: { code: number; }): Promise<void> {
    await this.driver.writeString(`CN01${DCSCodeToStringMap.get(code as ExtractMapKey<typeof DCSCodeToStringMap>)};`)
  }


  @command()
  getCTCSSFrequency(): Promise<number> {
    return this.readResponse("CN00;", this.parseCTCSSFrequencyResponse)
  }

  protected parseCTCSSFrequencyResponse(response: string): number | undefined {
    const ctcssMatch = response.match(/^CN00(\d{3});$/)

    if (!ctcssMatch) return

    return StringToCTCSSFrequencyMap.get(ctcssMatch[1] as ExtractMapKey<typeof StringToCTCSSFrequencyMap>)
  }

  @command({
    frequency: oneOf(
      Array.from(CTCSSFrequencyToStringMap.keys())
    )
  })
  async setCTCSSFrequency({ frequency }: { frequency: number }): Promise<void> {
    await this.driver.writeString(`CN00${CTCSSFrequencyToStringMap.get(frequency as ExtractMapKey<typeof CTCSSFrequencyToStringMap>)};`)
  }

  @command({
    direction: z
      .nativeEnum(Direction)
  })
  async scrollMemoryChannel({ direction }: { direction: Direction }): Promise<void> {
    await this.driver.writeString(direction === Direction.Up ? "CH0;" : "CH1;")
  }

  @command({
    direction: z
      .nativeEnum(Direction)
  })
  async changeBand({ direction }: { direction: Direction }): Promise<void> {
    await this.driver.writeString(direction === Direction.Up ? "BU0;" : "BD0;")
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
    return this.readResponse("BP00;", this.parseManualNotchEnabledResponse)
  }

  @command()
  getManualNotchFrequency(): Promise<number> {
    return this.readResponse("BP01;", this.parseManualNotchFrequencyResponse)
  }

  protected parseManualNotchEnabledResponse(response: string): boolean | null {
    return response.match(/^BP0000(0|1);$/) && response === "BP00001;"
  }

  protected parseManualNotchFrequencyResponse(response: string): number | null {
    const deciHzMatch = response.match(/^BP01(\d{3});$/)
    if (!deciHzMatch) return null

    return parseInt(deciHzMatch[1], 10) * 10
  }

  @command({
    enabled: z
      .boolean()
  })
  async setManualNotchEnabled({ enabled }: { enabled: boolean }): Promise<void> {
    await this.driver.writeString(enabled ? "BP00001;" : "BP00000;")
  }

  @command({
    frequency: z
      .number()
      .min(10)
      .step(10)
      .max(3200)
  })
  async setManualNotchFrequency({ frequency }: { frequency: number }): Promise<void> {
    await this.driver.writeString(`BP01${(frequency / 10).toString().padStart(3, "0")};`)
  }

  protected parseInformationResponse(
    response: string,
    band?: "opposite"
  ): {
    clarifier: number
    ctcssDec: boolean
    ctcssEnc: boolean
    duplex: false | "+" | "-"
    frequency: number
    memoryChannel: number
    mode: string // TBD
    p7: string // TBD
    rxClarifierEnabled: boolean
    txClarifierEnabled: boolean
  } | null {
    const prefix = band === "opposite" ? "OI" : "IF"

    if (!new RegExp(`^${prefix}.{25};$`).test(response)) return null

    const {
      memoryChannel,
      frequency,
      clarifierDirection,
      clarifierOffset,
      rxClarifierEnabled,
      txClarifierEnabled,
      mode, // needs to be mapped to enum
      p7, // not entirely sure what this does
      ctcss,
      duplex
    } = response.match(
      new RegExp(`^${prefix}(?<memoryChannel>\\d{3})(?<frequency>\\d{9})(?<clarifierDirection>\\+|-)(?<clarifierOffset>\\d{4})(?<rxClarifierEnabled>0|1)(?<txClarifierEnabled>0|1)(?<mode>\\d)(?<p7>\\d)(?<ctcss>\\d)00(?<duplex>\\d);$`)
    )!.groups!

    return {
      memoryChannel: parseInt(memoryChannel, 10),
      frequency: parseInt(frequency, 10),
      clarifier: parseInt(clarifierDirection + clarifierOffset, 10),
      rxClarifierEnabled: !!JSON.parse(rxClarifierEnabled),
      txClarifierEnabled: !!JSON.parse(txClarifierEnabled),
      mode,
      p7,
      ctcssEnc: ctcss === "1" || ctcss === "2",
      ctcssDec: ctcss === "1",
      duplex: duplex === "+" ? "+" : (duplex === "-" ? "-" : false)
    }
  }
}
