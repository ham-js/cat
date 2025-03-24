import { z } from "zod";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { TransceiverDriver } from "../base/TransceiverDriver";
import { toLittleEndianBCD } from "../../../utils/toLittleEndianBCD";
import { CommunicationDriver } from "../../../communication-drivers/base/CommunicationDriver";
import { padBytesEnd } from "../../../utils/padBytesEnd";
import { filter, firstValueFrom, map } from "rxjs";
import { delimiterParser } from "../../../parsers/delimiterParser";
import { fromLittleEndianBCD } from "../../../utils/fromLittleEndianBCD";
import { TransceiverVFOType } from "../base/TransceiverVFOType";
import { DeviceDriverCommandParameterType } from "../../base/DeviceCommandParameterType";
import { DeviceAgnosticDrivers } from "../../../communication-drivers/DeviceAgnosticDrivers";

const vfoType = z.enum([
    TransceiverVFOType.Current,
    TransceiverVFOType.Other
  ])

const VFOMap: Record<z.infer<typeof vfoType>, number> = {
  [TransceiverVFOType.Current]: 0,
  [TransceiverVFOType.Other]: 1,
}

const AGCAttackNumbers: Record<TransceiverAGCAttack.Fast | TransceiverAGCAttack.Mid | TransceiverAGCAttack.Slow, number> = {
  [TransceiverAGCAttack.Fast]: 1,
  [TransceiverAGCAttack.Mid]: 2,
  [TransceiverAGCAttack.Slow]: 3,
}

export class GenericDriver extends TransceiverDriver {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverVendor.ICOM
  static readonly supportedCommunicationDrivers = [
    ...DeviceAgnosticDrivers
  ]

  constructor(protected communicationDriver: CommunicationDriver, protected deviceAddress: number, protected controllerAddress: number = 0x01) {
    super(communicationDriver)
  }

  readonly _commands = {
    setAGC: Object.assign(
      ({ attack }: DeviceDriverCommandParameterType<TransceiverDriver, "setAGC">) =>
        this.communicationDriver.write(
          this.buildCommand(
            0x16,
            0x12,
            new Uint8Array([
              AGCAttackNumbers[attack as keyof typeof AGCAttackNumbers] // this is guaranteed by runtime validation
            ])
          )
        ),
      {
        parameterType: z.object({
          attack: z.enum([
            TransceiverAGCAttack.Fast,
            TransceiverAGCAttack.Mid,
            TransceiverAGCAttack.Slow
          ])
        })
      }
    ),
    setVFO: Object.assign(
      ({ frequency, vfo }: DeviceDriverCommandParameterType<TransceiverDriver, "setVFO">) =>
        this.communicationDriver.write(this.buildCommand(0x25, 0x00, new Uint8Array([VFOMap[vfo as keyof typeof VFOMap], ...padBytesEnd(toLittleEndianBCD(frequency), 5)]))),
      {
        parameterType: z.object({
          frequency: z
            .number()
            .int()
            .gte(30_000)
            .lte(56_000_000),
          vfo: vfoType
        })
      }),
    getVFO: Object.assign(
      async ({ vfo }: DeviceDriverCommandParameterType<TransceiverDriver, "getVFO">) => {
        const value = firstValueFrom(
          delimiterParser(this.communicationDriver.observable, 0xFD)
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

        await this.communicationDriver.write(this.buildCommand(0x25, 0x00))

        return value
      },
      {
        parameterType: z.object({
          vfo: vfoType
        })
      }
    )
  }

  protected getCommandData(command: Uint8Array): Uint8Array {
    return command.slice(6, command.length - 1)
  }

  protected commandMatchesDevice(command: Uint8Array): boolean {
    return command[2] == this.deviceAddress
      && command[3] == this.controllerAddress
  }

  protected buildCommand(command: number, subCommandNumber: number, data = new Uint8Array()): Uint8Array {
    return new Uint8Array([
      0xFE, // delimiter
      0xFE, // delimiter
      this.deviceAddress,
      this.controllerAddress,
      command,
      subCommandNumber,
      ...data,
      0xFD // delimiter
    ])
  }
}
