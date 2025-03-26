import { command } from "devices/base/decorators/command";
import { supportedDrivers } from "devices/base/decorators/supportedDrivers";
import { AGCAttack } from "devices/transceivers/base/AGCAttack";
import { Transceiver } from "devices/transceivers/base/Transceiver";
import { TransceiverVendor } from "devices/transceivers/base/TransceiverVendor";
import { VFOType } from "devices/transceivers/base/VFOType";
import { DriverType } from "drivers/base/DriverType";
import { z } from "zod";

interface State {
  agcAttack: AGCAttack
  currentVFO: VFOType.A | VFOType.B
  vfo: Record<VFOType.A | VFOType.B, number>
}

@supportedDrivers([
  DriverType.DummyDriver
])
export class VirtualTransceiver extends Transceiver {
  static deviceName = "Transceiver"
  static deviceVendor = TransceiverVendor.Virtual

  state: State = {
    agcAttack: AGCAttack.Auto,
    currentVFO: VFOType.A,
    vfo: {
      [VFOType.A]: 14_250_300,
      [VFOType.B]: 7_200_000,
    }
  }

  @command({
    vfo: z.nativeEnum(VFOType)
  })
  async getVFO({ vfo }: { vfo: VFOType; }): Promise<number> {
    return Promise.resolve(this.state.vfo[this.getVFOType(vfo)])
  }

  @command({
    frequency: z.number().int(),
    vfo: z.nativeEnum(VFOType)
  })
  async setVFO({ frequency, vfo }: { frequency: number; vfo: VFOType; }): Promise<void> {
    this.state.vfo[this.getVFOType(vfo)] = frequency 
  }

  @command({
    attack: z.nativeEnum(AGCAttack)
  })
  async setAGC({ attack }: { attack: AGCAttack; }): Promise<void> {
    this.state.agcAttack = attack 
  }

  protected getVFOType(vfo: VFOType): State['currentVFO'] {
    if (vfo === VFOType.A || vfo === VFOType.B) return vfo
    if (vfo === VFOType.Current) return this.state.currentVFO

    return this.state.currentVFO === VFOType.A ? VFOType.B : VFOType.A
  }
}
