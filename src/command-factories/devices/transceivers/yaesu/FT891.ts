import { z } from "zod"
import { DeviceType } from "../../base/enums/DeviceType";
import { YaesuTransceiverDevice } from "./base/types/YaesuTransceiverDevice";
import { CommandFactory } from "../../base/types/CommandFactory";

const setVFOParamType = z.object({
  frequency: z.number().gte(30_000).lte(56_000_000),
  vfo: z.number().int().min(0).max(1)
})
const setVFO: CommandFactory<z.infer<typeof setVFOParamType>> = ({ frequency, vfo }) => `F${vfo === 0 ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
setVFO.parameterType = setVFOParamType

export const FT891 = {
  deviceName: "FT-891",
  deviceVendor: "Yaesu",
  deviceType: DeviceType.Transceiver,
  commands: {
    setVFO
  }
} satisfies YaesuTransceiverDevice
