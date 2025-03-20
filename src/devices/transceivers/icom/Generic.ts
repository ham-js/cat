import { z } from "zod";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { TransceiverDeviceVendor } from "../base/TransceiverDeviceVendor";
import { TransceiverDevice } from "../base/TransceiverDevice";
import { toLittleEndianBCD } from "../../../utils/toLittleEndianBCD";
import { SerialPort } from "../../base/SerialPort";
import { padBytesEnd } from "../../../utils/padBytesEnd";
import { filter, firstValueFrom, map } from "rxjs";
import { delimiterParser } from "../../../parsers/delimiterParser";
import { fromLittleEndianBCD } from "../../../utils/fromLittleEndianBCD";
import { TransceiverCommands } from "../base/TransceiverCommands";
import { TransceiverVFOType } from "../base/TransceiverVFOType";

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

export class Generic extends TransceiverDevice {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverDeviceVendor.ICOM

  constructor(protected serialPort: SerialPort, protected deviceAddress: number, protected controllerAddress: number = 0x01) {
    super(serialPort)
  }

  readonly _commands = {
    setAGC: Object.assign(
      ({ attack }: Parameters<NonNullable<TransceiverCommands["setAGC"]>>[0]) =>
        this.serialPort.write(
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
    setVFO: Object.assign( // 0 is current, 1 is other
      ({ frequency, vfo }: Parameters<TransceiverCommands["setVFO"]>[0]) =>
        this.serialPort.write(this.buildCommand(0x25, 0x00, new Uint8Array([VFOMap[vfo as keyof typeof VFOMap], ...padBytesEnd(toLittleEndianBCD(frequency), 5)]))),
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
    getVFO: Object.assign( // 0 is current, 1 is other
      async ({ vfo }: Parameters<TransceiverCommands["getVFO"]>[0]) => {
        const value = firstValueFrom(
          delimiterParser(this.serialPort.observable, 0xFD)
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

        await this.serialPort.write(this.buildCommand(0x25, 0x00))

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
