import { VFOType } from "./VFOType"

export enum TransceiverEventType {
  VFO = "vfo"
}

export type TransceiverEvent = ({
  frequency: number,
  type: TransceiverEventType,
  vfo: VFOType
}) & {timestamp: Date}
