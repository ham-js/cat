import { FT891 } from "./yaesu/FT891"
import { FT991 } from "./yaesu/FT991"
import { GenericTransceiver as ICOMGenericTransceiver } from "./icom/GenericTransceiver"
import { GenericTransceiver as KenwoodGenericTransceiver } from "./kenwood/GenericTransceiver"
import { GenericTransceiver as YaesuGenericTransceiver } from "./yaesu/GenericTransceiver"
import { VirtualTransceiver } from "./VirtualTransceiver"
import { Transceiver } from "./base/Transceiver"
import { AGCAttack } from "./base/AGCAttack"
import { TransceiverVendor } from "./base/TransceiverVendor"
import { VFOType } from "./base/VFOType"
import { TransceiverEvent } from "./base/TransceiverEvent"
import { Direction } from "./base/Direction"
import { Band, Bands } from "./base/Bands"
import { CTCSSFrequencies } from "./base/CTCSSFrequencies"
import { AntennaTunerState } from "./base/AntennaTunerState"

export const ICOMTransceivers: typeof Transceiver[] = [
  ICOMGenericTransceiver
]

export const KenwoodTransceivers: typeof Transceiver[] = [
  KenwoodGenericTransceiver
]

export const YaesuTransceivers: typeof Transceiver[] = [
  YaesuGenericTransceiver,
  FT891,
  FT991
]

export const Transceivers: typeof Transceiver[] = [
  ...ICOMTransceivers,
  ...KenwoodTransceivers,
  ...YaesuTransceivers,
  VirtualTransceiver
]

export {
  AGCAttack,
  AntennaTunerState,
  Band,
  Bands,
  CTCSSFrequencies,
  Direction,
  ICOMGenericTransceiver,
  KenwoodGenericTransceiver,
  Transceiver,
  TransceiverEvent,
  TransceiverVendor,
  VFOType,
  VirtualTransceiver,
  YaesuGenericTransceiver,
}
