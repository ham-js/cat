import { z } from "zod"
import { DeviceType } from "../../base/enums/DeviceType";
import { YaesuTransceiverDevice } from "./base/types/YaesuTransceiverDevice";
import { CommandFactory } from "../../base/types/CommandFactory";

const vfoType = z.number().int().min(0).max(1) // FT-891 has two VFOs

const setVFO: CommandFactory<z.infer<typeof setVFOParameterType>> =
  ({ frequency, vfo }) => `F${vfo === 0 ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
const setVFOParameterType = z.object({
  frequency: z
    .number()
    .int()
    .gte(30_000)
    .lte(56_000_000),
  vfo: vfoType
})
setVFO.parameterType = setVFOParameterType

const getVFO: CommandFactory<z.infer<typeof getVFOParameterType>> =
  ({ vfo }) => `F${vfo === 0 ? 'A' : 'B'};`
const getVFOParameterType = z.object({
  vfo: vfoType
})
getVFO.parameterType = getVFOParameterType

export const FT891 = {
  deviceName: "FT-891",
  deviceVendor: "Yaesu",
  deviceType: DeviceType.Transceiver,
  commands: {
    getVFO,
    setVFO
  }
} satisfies YaesuTransceiverDevice
