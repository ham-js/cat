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
import { AGCState } from "./base/AGCState"
import { CTCSSFrequencyToStringMap as KenwoodCTCSSFrequencyToStringMap } from "./kenwood/CTCSSFrequencyToStringMap"
import { StringToCTCSSFrequencyMap as KenwoodStringToCTCSSFrequencyMap } from "./kenwood/StringToCTCSSFrequencyMap"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICOMTransceivers: typeof Transceiver<any>[] = [
  ICOMGenericTransceiver
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const KenwoodTransceivers: typeof Transceiver<any>[] = [
  KenwoodGenericTransceiver
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const YaesuTransceivers: typeof Transceiver<any>[] = [
  YaesuGenericTransceiver,
  FT891,
  FT991
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Transceivers: typeof Transceiver<any>[] = [
  ...ICOMTransceivers,
  ...KenwoodTransceivers,
  ...YaesuTransceivers,
  VirtualTransceiver
]

export {
  AGCAttack,
  AGCState,
  AntennaTunerState,
  Band,
  Bands,
  CTCSSFrequencies,
  Direction,
  ICOMGenericTransceiver,
  KenwoodCTCSSFrequencyToStringMap,
  KenwoodGenericTransceiver,
  KenwoodStringToCTCSSFrequencyMap,
  Transceiver,
  TransceiverEvent,
  TransceiverVendor,
  VFOType,
  VirtualTransceiver,
  YaesuGenericTransceiver,
}
