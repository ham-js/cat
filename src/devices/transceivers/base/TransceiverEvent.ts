import { AntennaTunerState } from "./AntennaTunerState"
import { VFOType } from "./VFOType"

export enum TransceiverEventType {
  AFGain = "AFGain",
  AntennaTuner = "AntennaTuner",
  AutoNotch = "AutoNotch",
  BreakIn = "BreakIn",
  ManualNotchEnabled = "ManualNotchEnabled",
  ManualNotchFrequency = "ManualNotchFrequency",
  VFO = "VFO"
}

export type TransceiverEvent = ({
  frequency: number,
  type: TransceiverEventType.VFO,
  vfo: VFOType
} | {
  state: AntennaTunerState,
  type: TransceiverEventType.AntennaTuner
} | {
  gain: number,
  type: TransceiverEventType.AFGain
} | {
  enabled: boolean,
  type: TransceiverEventType.AutoNotch | TransceiverEventType.BreakIn
} | {
  enabled: boolean,
  type: TransceiverEventType.ManualNotchEnabled
} | {
  frequency: number,
  type: TransceiverEventType.ManualNotchFrequency
}) & {timestamp: Date}
