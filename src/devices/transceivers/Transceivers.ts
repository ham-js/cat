import { ICOMTransceivers } from "devices/transceivers/icom/ICOMTransceivers";
import { KenwoodTransceivers } from "devices/transceivers/kenwood/KenwoodTransceivers";
import { VirtualTransceiver } from "devices/transceivers/VirtualTransceiver";
import { YaesuTransceivers } from "devices/transceivers/yaesu/YaesuTransceivers";

export const Transceivers = [
  ...ICOMTransceivers,
  ...KenwoodTransceivers,
  ...YaesuTransceivers,
  VirtualTransceiver
]
