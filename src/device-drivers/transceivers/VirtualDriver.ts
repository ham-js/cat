import { z } from "zod";
import { TransceiverDriver } from "./base/TransceiverDriver";
import { TransceiverVendor } from "./base/TransceiverVendor";
import { TransceiverVFOType } from "./base/TransceiverVFOType";
import { DeviceDriverCommandParameterType } from "../base/DeviceCommandParameterType";
import { TransceiverAGCAttack } from "./base/TransceiverAGCAttack";

interface State {
  agcAttack: TransceiverAGCAttack
  currentVFO: TransceiverVFOType.A | TransceiverVFOType.B
  vfo: Record<TransceiverVFOType.A | TransceiverVFOType.B, number>
}

export class VirtualDriver extends TransceiverDriver {
  static deviceName = "Transceiver"
  static deviceVendor = TransceiverVendor.Virtual

  state: State = {
    agcAttack: TransceiverAGCAttack.Auto,
    currentVFO: TransceiverVFOType.A,
    vfo: {
      [TransceiverVFOType.A]: 14_250_300,
      [TransceiverVFOType.B]: 7_200_000,
    }
  }

  protected getVFO(vfo: TransceiverVFOType): State['currentVFO'] {
    if (vfo === TransceiverVFOType.A || vfo === TransceiverVFOType.B) return vfo
    if (vfo === TransceiverVFOType.Current) return this.state.currentVFO

    return this.state.currentVFO === TransceiverVFOType.A ? TransceiverVFOType.B : TransceiverVFOType.A
  }

  readonly _commands = {
    getVFO: Object.assign(
      ({ vfo }: DeviceDriverCommandParameterType<TransceiverDriver, "getVFO">) => this.state.vfo[this.getVFO(vfo)],
      {
        parameterType: z.object({
          vfo: z.nativeEnum(TransceiverVFOType)
        })
      }
    ),
    setAGC: Object.assign(
      ({ attack }: DeviceDriverCommandParameterType<TransceiverDriver, "setAGC">) => { this.state.agcAttack = attack },
      {
        parameterType: z.object({
          attack: z.nativeEnum(TransceiverAGCAttack)
        })
      }
    ),
    setVFO: Object.assign(
      ({ frequency, vfo }: DeviceDriverCommandParameterType<TransceiverDriver, "setVFO">) => { this.state.vfo[this.getVFO(vfo)] = frequency },
      {
        parameterType: z.object({
          frequency: z.number().int(),
          vfo: z.nativeEnum(TransceiverVFOType)
        })
      }
    )
  }
}
