import { AGCAttack } from "./AGCAttack"
import { AntennaTunerState } from "./AntennaTunerState"
import { VFOType } from "./VFOType"

export enum TransceiverEventType {
  AFGain = "AFGain",
  AGCAttack = "AGCAttack",
  AGCAuto = "AGCAuto",
  AntennaTuner = "AntennaTuner",
  AutoNotch = "AutoNotch",
  BreakIn = "BreakIn",
  CTCSSFrequency = "CTCFrequency",
  DCSCode = "DCSCode",
  ManualNotchEnabled = "ManualNotchEnabled",
  ManualNotchFrequencyOffset = "ManualNotchFrequencyOffset",
  RITEnabled = "RITEnabled",
  TXBusy = "TXBusy",
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
  type: TransceiverEventType.AutoNotch | TransceiverEventType.BreakIn | TransceiverEventType.RITEnabled
} | {
  enabled: boolean,
  type: TransceiverEventType.ManualNotchEnabled
} | {
  frequency: number,
  type: TransceiverEventType.CTCSSFrequency
} | {
  busy: boolean,
  type: TransceiverEventType.TXBusy
} | {
  code: number,
  type: TransceiverEventType.DCSCode
} | {
  attack: Omit<AGCAttack, AGCAttack.Auto>,
  type: TransceiverEventType.AGCAttack
} | {
  auto: boolean,
  type: TransceiverEventType.AGCAuto
} | {
  frequencyOffset: number,
  type: TransceiverEventType.ManualNotchFrequencyOffset
}) & {timestamp: Date}
