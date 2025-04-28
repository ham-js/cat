import { z } from "zod";
import { DriverType } from "../../drivers";
import { command } from "../base/decorators/command";
import { supportedDrivers } from "../base/decorators/supportedDrivers";
import { AGCAttack } from "./base/AGCAttack";
import { Transceiver } from "./base/Transceiver";
import { TransceiverVendor } from "./base/TransceiverVendor";
import { VFOType } from "./base/VFOType";

interface State {
  agcAttack: AGCAttack
  vfo: Record<VFOType, number>
}

@supportedDrivers([
  DriverType.DummyDriver
])
export class VirtualTransceiver extends Transceiver<never> {
  static deviceName = "Transceiver"
  static deviceVendor = TransceiverVendor.Virtual

  state: State = {
    agcAttack: AGCAttack.Auto,
    vfo: {
      [VFOType.Current]: 14_250_300,
      [VFOType.Other]: 7_200_000,
    }
  }

  @command({
    vfo: z.nativeEnum(VFOType)
  })
  async getVFOFrequency({ vfo }: { vfo: VFOType; }): Promise<number> {
    return Promise.resolve(this.state.vfo[vfo])
  }

  @command({
    frequency: z.number().int(),
    vfo: z.nativeEnum(VFOType)
  })
  async setVFOFrequency({ frequency, vfo }: { frequency: number; vfo: VFOType; }): Promise<void> {
    this.state.vfo[vfo] = frequency 
  }

  @command({
    attack: z.nativeEnum(AGCAttack)
  })
  async setAGCAttack({ attack }: { attack: AGCAttack; }): Promise<void> {
    this.state.agcAttack = attack 
  }
}
