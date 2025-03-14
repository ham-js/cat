import { z } from "zod"
import { YaesuTransceiverDevice } from "./base/types/YaesuTransceiverDevice";
import { CommandFactory } from "../../base/types/CommandFactory";
import { TransceiverAGCAttack } from "../base/types/TransceiverAGCAttack";

const vfoType = z.number().int().min(0).max(1) // FT-891 has two VFOs

const AGCAttackNumbers: Record<TransceiverAGCAttack, number> = {
  [TransceiverAGCAttack.Off]: 0,
  [TransceiverAGCAttack.Fast]: 1,
  [TransceiverAGCAttack.Mid]: 2,
  [TransceiverAGCAttack.Slow]: 3,
  [TransceiverAGCAttack.Auto]: 4,
}
const setAGC: CommandFactory<z.infer<typeof setAGCParameterType>> =
  ({ attack }) => `GT0${AGCAttackNumbers[attack]};` 
const setAGCParameterType = z.object({
  /**
   * The AGC attack. Can be TransceiverAGCAttack.Off, TransceiverAGCAttack.Fast,
   * TransceiverAGCAttack.Mid, TransceiverAGCAttack.Slow or
   * TransceiverAGCAttack.Auto
   * @type {TransceiverAGCAttack}
   * @ignore
   */
  attack: z
    .nativeEnum(TransceiverAGCAttack)
})
setAGC.parameterType = setAGCParameterType

const setVFO: CommandFactory<z.infer<typeof setVFOParameterType>> =
  ({ frequency, vfo }) => `F${vfo === 0 ? 'A' : 'B'}${frequency.toString(10).padStart(9, '0')};`
const setVFOParameterType = z.object({
  /**
   * The frequency of VFO A or B
   * @type {number} Between 30 kHz and 50 MHz
   * @ignore
   */
  frequency: z
    .number()
    .int()
    .gte(30_000)
    .lte(56_000_000),
  /**
   * VFO A (=0) or B (=1)
   * @type {0 | 1}
   * @ignore
   */
  vfo: vfoType
})
setVFO.parameterType = setVFOParameterType

const getVFO: CommandFactory<z.infer<typeof getVFOParameterType>> =
  ({ vfo }) => `F${vfo === 0 ? 'A' : 'B'};`
const getVFOParameterType = z.object({
  /**
   * VFO A (=0) or B (=1)
   * @type {0 | 1}
   * @ignore
   */
  vfo: vfoType
})
getVFO.parameterType = getVFOParameterType

export class FT891 extends YaesuTransceiverDevice {
  static readonly deviceName = "FT-891"

  readonly _commandFactories = {
    getVFO,
    setAGC,
    setVFO
  }
}
