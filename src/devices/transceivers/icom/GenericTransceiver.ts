import { filter, firstValueFrom, map } from "rxjs"
import { z } from "zod"

import { AGCAttack } from "../base/AGCAttack"
import { TransceiverVendor } from "../base/TransceiverVendor"
import { delimiterParser } from "../../base/parsers/delimiterParser"
import { fromLittleEndianBCD } from "../../base/utils/fromLittleEndianBCD"
import { padBytesEnd } from "../../base/utils/padBytesEnd"
import { toLittleEndianBCD } from "../../base/utils/toLittleEndianBCD"
import { VFOType } from "../base/VFOType"
import { supportedDrivers } from "../../base/decorators/supportedDrivers"
import { Transceiver } from "../base/Transceiver"
import { Driver } from "../../../drivers/base/Driver"
import { command } from "../../base/decorators/command"
import { device } from "../../base/decorators/device"
import { DeviceAgnosticDriverTypes } from "../../../drivers"

const vfoType = z.enum([
    VFOType.Current,
    VFOType.Other
  ])

const VFOMap: Record<z.infer<typeof vfoType>, number> = {
  [VFOType.Current]: 0,
  [VFOType.Other]: 1,
}

const AGCAttackNumbers: Record<AGCAttack.Fast | AGCAttack.Mid | AGCAttack.Slow, number> = {
  [AGCAttack.Fast]: 1,
  [AGCAttack.Mid]: 2,
  [AGCAttack.Slow]: 3,
}

@supportedDrivers([
  ...DeviceAgnosticDriverTypes
])
@device({
  deviceAddress: z
    .number()
    .int()
    .gt(0),
  controllerAddress: z
    .number()
    .int()
    .gt(0),
})
export class GenericTransceiver extends Transceiver<Uint8Array> {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.ICOM

  constructor(protected driver: Driver, protected parameter: { deviceAddress: number, controllerAddress: number }) {
    super(driver, parameter)

    this.data = delimiterParser(this.driver.data, 0xFD)
  }

  @command({
    attack: z.enum([
      AGCAttack.Fast,
      AGCAttack.Mid,
      AGCAttack.Slow
    ])
  })
  async setAGCAttack({ attack }: { attack: AGCAttack }): Promise<void> {
    await this.driver.write(
      this.buildCommand(
        0x16,
        0x12,
        new Uint8Array([
          AGCAttackNumbers[attack as keyof typeof AGCAttackNumbers] // this is guaranteed by runtime validation
        ])
      )
    )
  }

  @command({
    frequency: z
      .number()
      .int()
      .gte(30_000)
      .lte(56_000_000),
    vfo: vfoType
  })
  async setVFOFrequency({ frequency, vfo }: { frequency: number; vfo: VFOType }): Promise<void> {
    await this.driver.write(
      this.buildCommand(
        0x25,
        0x00,
        new Uint8Array([
          VFOMap[vfo as keyof typeof VFOMap],
          ...padBytesEnd(toLittleEndianBCD(frequency), 5)
        ])
      )
    )
  }

  @command({
    vfo: vfoType
  })
  async getVFOFrequency({ vfo }: { vfo: VFOType }): Promise<number> {
    const value = firstValueFrom(
      delimiterParser(this.driver.data, 0xFD)
        .pipe(
          filter((command) =>
            this.commandMatchesDevice(command)
            && command[4] === 0x25
            && command[5] == 0x00
            && this.getCommandData(command)[0] === VFOMap[vfo as keyof typeof VFOMap]
          ),
          map((command) => fromLittleEndianBCD(this.getCommandData(command).slice(1)))
        )
    )

    await this.driver.write(this.buildCommand(0x25, 0x00))

    return value
  }

  protected getCommandData(command: Uint8Array): Uint8Array {
    return command.slice(6, command.length - 1)
  }

  protected commandMatchesDevice(command: Uint8Array): boolean {
    return command[2] == this.parameter.deviceAddress
      && command[3] == this.parameter.controllerAddress
  }

  protected buildCommand(command: number, subCommandNumber: number, data = new Uint8Array()): Uint8Array {
    return new Uint8Array([
      0xFE, // delimiter
      0xFE, // delimiter
      this.parameter.deviceAddress,
      this.parameter.controllerAddress,
      command,
      subCommandNumber,
      ...data,
      0xFD // delimiter
    ])
  }
}
