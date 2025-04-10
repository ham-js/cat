import { VFOType } from "./VFOType"

export enum TransceiverEventType {
  AFGain = "AFGain",
  AntennaTunerRX = "AntennaTunerRX",
  AntennaTunerTX = "AntennaTunerTX",
  AntennaTunerTuning = "AntennaTunerTuning",
  AutoNotch = "AutoNotch",
  BreakIn = "BreakIn",
  CTCSSFrequency = "CTCFrequency",
  DCSCode = "DCSCode",
  ManualNotchEnabled = "ManualNotchEnabled",
  ManualNotchFrequency = "ManualNotchFrequency",
  RITEnabled = "RITEnabled",
  RXBusy = "RXBusy",
  VFO = "VFO"
}

export type TransceiverEvent = ({
  frequency: number,
  type: TransceiverEventType.VFO,
  vfo: VFOType
} | {
  rx: boolean,
  type: TransceiverEventType.AntennaTunerRX
} | {
  tx: boolean,
  type: TransceiverEventType.AntennaTunerTX
} | {
  tuning: boolean,
  type: TransceiverEventType.AntennaTunerTuning
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
  type: TransceiverEventType.ManualNotchFrequency | TransceiverEventType.CTCSSFrequency
} | {
  busy: boolean,
  type: TransceiverEventType.RXBusy
} | {
  code: number,
  type: TransceiverEventType.DCSCode
}) & {timestamp: Date}
