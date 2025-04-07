import { firstValueFrom, filter, defer, map, share, merge, connect } from "rxjs";
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

@supportedDrivers([
  DriverType.CP210xWebUSBDriver,
  ...DeviceAgnosticDriverTypes
])
export class GenericTransceiver extends Transceiver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.Yaesu

  readonly events = defer(() => {
    this.enableAutoInformation({})

    return delimiterParser(this.driver.stringObservable(), ";")
      .pipe(
        connect((response$) => merge(
          parseResponse(
            response$,
            this.parseInformationResponse,
            (informationResponse) => ({ frequency: informationResponse.frequency, type: TransceiverEventType.VFO, vfo: VFOType.Current }),
            "frequency"
          ),
          parseResponse(
            response$,
            (response) => this.parseInformationResponse(response, "opposite"),
            (informationResponse) => ({ frequency: informationResponse.frequency, type: TransceiverEventType.VFO, vfo: VFOType.Other }),
            "frequency"
          )
        ))
      )
  }).pipe(share())

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

  @command({})
  async enableAutoInformation(_: {}) {
    await this.driver.writeString("AI1;")
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

    if (!new RegExp(`${prefix}.{25};`).test(response)) return null

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
      new RegExp(`${prefix}(?<memoryChannel>\\d{3})(?<frequency>\\d{9})(?<clarifierDirection>\\+|-)(?<clarifierOffset>\\d{4})(?<rxClarifierEnabled>0|1)(?<txClarifierEnabled>0|1)(?<mode>\\d)(?<p7>\\d)(?<ctcss>\\d)00(?<duplex>\\d);`)
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
