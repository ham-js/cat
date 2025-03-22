import { TransceiverDriver } from "./base/TransceiverDriver";
import { ICOMTransceiverDrivers } from "./icom/ICOMTransceiverDrivers";
import { KenwoodTransceiverDrivers } from "./kenwood/KenwoodTransceiverDevices";
import { VirtualDriver } from "./VirtualDriver";
import { YaesuTransceiverDrivers } from "./yaesu/YaesuTransceiverDrivers";

export const TransceiverDevices: Omit<typeof TransceiverDriver, "()">[] = [
  ...ICOMTransceiverDrivers,
  ...KenwoodTransceiverDrivers,
  ...YaesuTransceiverDrivers,
  VirtualDriver
]
