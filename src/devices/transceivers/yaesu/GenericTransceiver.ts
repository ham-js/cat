import { firstValueFrom, filter, defer, map, share, merge, connect, timeout, finalize } from "rxjs";
import { z } from "zod";
import { DeviceAgnosticDriverTypes, DriverType } from "../../../drivers";
import { command } from "../../base/decorators/command";
import { supportedDrivers } from "../../base/decorators/supportedDrivers";
import { delimiterParser } from "../../base/parsers/delimiterParser";
import { AGCAttack } from "../base/AGCAttack";
import { Transceiver } from "../base/Transceiver";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { TransceiverEventType } from "../base/TransceiverEvent";
import { parseResponse } from "../../base/utils/parseResponse";
import { AntennaTunerState } from "../base/AntennaTunerState";
import { Direction } from "../base/Direction";
import { Band, Bands } from "../base/Band";

const vfoType = z.enum([
  VFOType.Current,
  VFOType.Other
])

const AGCAttackNumbers: Record<AGCAttack, number> = {
  [AGCAttack.Off]: 0,
  [AGCAttack.Fast]: 1,
  [AGCAttack.Mid]: 2,
  [AGCAttack.Slow]: 3,
  [AGCAttack.Auto]: 4,
}

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

const CTCSSFrequencies: Record<string, number> = {
  "000": 67,
  "001": 69.3,
  "002": 71.9,
  "003": 74.4,
  "004": 77,
  "005": 79.7,
  "006": 82.5,
  "007": 85.4,
  "008": 88.5,
  "009": 91.5,
  "010": 94.8,
  "011": 97.4,
  "012": 100,
  "013": 103.5,
  "014": 107.2,
  "015": 110.9,
  "016": 114.8,
  "017": 118.8,
  "018": 123,
  "019": 127.3,
  "020": 131.8,
  "021": 136.5,
  "022": 141.3,
  "023": 146.2,
  "024": 151.4,
  "025": 156.7,
  "026": 159.8,
  "027": 162.2,
  "028": 165.5,
  "029": 167.9,
  "030": 171.3,
  "031": 173.8,
  "032": 177.3,
  "033": 179.9,
  "034": 183.5,
  "035": 186.2,
  "036": 189.9,
  "037": 192.8,
  "038": 196.6,
  "039": 199.5,
  "040": 203.5,
  "041": 206.5,
  "042": 210.7,
  "043": 218.1,
  "044": 225.7,
  "045": 229.1,
  "046": 233.6,
  "047": 241.8,
  "048": 250.3,
  "049": 254.1
}

@supportedDrivers([
  DriverType.CP210xWebUSBDriver,
  ...DeviceAgnosticDriverTypes
])
export class GenericTransceiver extends Transceiver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.Yaesu

  responseTimeout = 1000

  readonly events = defer(() => {
    this.setAutoInformation({ enabled: true })

    return delimiterParser(this.driver.stringObservable(), ";")
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
            this.parseAntennaTunerResponse,
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
  async setAutoNotch({ enabled }: { enabled: boolean }): Promise<void> {
    await this.driver.writeString(enabled ? "BC01;" : "BC00;")
  }

  @command()
  getAutoNotch(): Promise<boolean> {
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
  async getVFO({ vfo }: { vfo: VFOType }): Promise<number> {
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
  async setVFO({ frequency, vfo }: { frequency: number; vfo: VFOType; }): Promise<void> {
    await this.driver.writeString(
      `F${vfo === VFOType.Current ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
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

  @command({
    state: z.nativeEnum(AntennaTunerState)
  })
  async setAntennaTuner({ state }: { state: AntennaTunerState }): Promise<void> {
    if (state === AntennaTunerState.Off) await this.driver.writeString("AC000;")
    else if (state === AntennaTunerState.On) await this.driver.writeString("AC001;")
    else if (state === AntennaTunerState.StartTuning) await this.driver.writeString("AC002;")
  }

  @command()
  getAntennaTuner(): Promise<AntennaTunerState> {
    return this.readResponse("AC;", this.parseAntennaTunerResponse)
  }

  protected parseAntennaTunerResponse(response: string): AntennaTunerState | null {
    const stateMatch = response.match(/^AC00(\d);$/)
    if (!stateMatch) return null

    if (stateMatch[1] === "1") return AntennaTunerState.On
    if (stateMatch[1] === "2") return AntennaTunerState.StartTuning
    else return AntennaTunerState.Off
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
  getCTCSSFrequency(): Promise<number> {
    return this.readResponse("CN00;", this.parseCTCSSResponse)
  }

  protected parseCTCSSResponse(response: string): number | null {
    const ctcssMatch = response.match(/^CN00(\d{3});$/)

    if (!ctcssMatch) return null

    return CTCSSFrequencies[ctcssMatch[1]]
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

  @command()
  getBreakIn(): Promise<boolean> {
    return this.readResponse("BI;", this.parseBreakInResponse)
  }

  protected parseBreakInResponse(response: string): boolean | null {
    return response.match(/^BI(0|1);$/) && response === "BI1;"
  }

  @command({
    enabled: z
      .boolean()
  })
  async setBreakIn({ enabled }: { enabled: boolean }): Promise<void> {
    await this.driver.writeString(`BI${enabled ? "1" : "0"};`)
  }

  @command()
  async getManualNotch(): Promise<{ enabled: boolean; frequency: number; }> {
    const enabled = await this.readResponse("BP00;", this.parseManualNotchEnabledResponse)
    const frequency = await this.readResponse("BP01;", this.parseManualNotchFrequencyResponse)

    return {
      enabled,
      frequency
    }
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
      .optional(),
    frequency: z
      .number()
      .min(10)
      .step(10)
      .max(3200)
      .optional()
  })
  async setManualNotch({ enabled, frequency }: { enabled?: boolean; frequency?: number; }): Promise<void> {
    if (enabled !== undefined) await this.driver.writeString(enabled ? "BP00001;" : "BP00000;")
    if (frequency !== undefined) await this.driver.writeString(`BP01${(frequency / 10).toString().padStart(3, "0")};`)
  }

  protected async readResponse<MapResult>(command: string, mapFn: (response: string) => MapResult, responseTimeout = this.responseTimeout): Promise<NonNullable<MapResult>> {
    const value = firstValueFrom(
      delimiterParser(this.driver.stringObservable(), ";")
        .pipe(
          map(mapFn),
          filter((value) => value !== null && value !== undefined),
          timeout(responseTimeout)
        )
    )

    await this.driver.writeString(command)

    return value
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
