import { z } from "zod";
import { TransceiverAGCAttack } from "../base/enums/TransceiverAGCAttack";
import { TransceiverDeviceVendor } from "../base/enums/TransceiverDeviceVendor";
import { TransceiverDevice } from "../base/types/TransceiverDevice";
import { toLittleEndianBCD } from "../../../utils/toLittleEndianBCD";
import { getDigit } from "../../../utils/getDigit";

const vfoType = z.number().int().min(0).max(1)

export class Generic extends TransceiverDevice {
  static readonly deviceName: string = "Generic Transceiver"
  static readonly deviceVendor = TransceiverDeviceVendor.ICOM

  constructor(protected deviceAddress: number, protected controllerAddress: number = 0x01) {
    super()
  }

  readonly _commandFactories = {
    setAGC: Object.assign(
      ({ attack }: { attack: TransceiverAGCAttack }) => "",
      { parameterType: z.object({ attack: z.nativeEnum(TransceiverAGCAttack) })}
    ),
    setVFO: Object.assign(
      ({ frequency, vfo }: { frequency: number, vfo: number }) =>
        new Uint16Array([
        0xFE,
        0xFE,
        this.deviceAddress,
        this.controllerAddress,
        0x00,
        0x00,
        ...toLittleEndianBCD(frequency),
        0xFD
      ]),
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
      ({ vfo }: { vfo: number }) => this.buildCommandArray(0x00, 0x00, new Uint16Array([0, 0, 0, 0, 0])),
      { parameterType: z.object({ vfo: vfoType }) }
    )
  }

  protected buildCommandArray(command: number, subCommandNumber: number, data: Uint16Array): Uint16Array {
    return new Uint16Array([
      0xFE,
      0xFE,
      this.deviceAddress,
      this.controllerAddress,
      command,
      subCommandNumber,
      ...data,
      0xFD
    ])
  }
}
