import { TransceiverDriver } from "./base/TransceiverDriver";
import { ICOMTransceiverDrivers } from "./icom/ICOMTransceiverDrivers";
import { KenwoodTransceiverDrivers } from "./kenwood/KenwoodTransceiverDevices";
import { YaesuTransceiverDrivers } from "./yaesu/YaesuTransceiverDrivers";

export const TransceiverDevices: Omit<typeof TransceiverDriver, "()">[] = [
  ...ICOMTransceiverDrivers,
  ...KenwoodTransceiverDrivers,
  ...YaesuTransceiverDrivers
]
