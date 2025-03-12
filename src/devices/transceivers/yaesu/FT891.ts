import { z } from "zod"
import { DeviceType } from "../../base/enums/DeviceType";
import { YaesuTransceiverDevice } from "./base/types/YaesuTransceiverDevice";
import { CommandFactory } from "../../base/types/CommandFactory";
import { AGCLevel as BaseAGCLevel } from "../base/types/TransceiverDevice";

const vfoType = z.number().int().min(0).max(1) // FT-891 has two VFOs

const AGCLevel = {
  ...BaseAGCLevel,
  Auto: 'Auto'
} as const
const AGCLevels: Record<keyof typeof AGCLevel, number> = {
  [AGCLevel.Off]: 0,
  [AGCLevel.Fast]: 1,
  [AGCLevel.Mid]: 2,
  [AGCLevel.Slow]: 3,
  [AGCLevel.Auto]: 4
}
const setAGC: CommandFactory<z.infer<typeof setAGCParameterType>> =
  ({ level }) => `GT0${AGCLevels[level as keyof typeof AGCLevel]}` 
const setAGCParameterType = z.object({
  level: z.nativeEnum(AGCLevel)
})
setAGC.parameterType = setAGCParameterType

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
    setAGC,
    setVFO
  }
} satisfies YaesuTransceiverDevice
