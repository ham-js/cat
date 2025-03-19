import { TransceiverDevice } from "./base/TransceiverDevice";
import { ICOMTransceiverDevices } from "./icom/ICOMTransceiverDevices";
import { KenwoodTransceiverDevices } from "./kenwood/KenwoodTransceiverDevices";
import { YaesuTransceiverDevices } from "./yaesu/YaesuTransceiverDevices";

export const TransceiverDevices: Omit<typeof TransceiverDevice, "()">[] = [
  ...ICOMTransceiverDevices,
  ...KenwoodTransceiverDevices,
  ...YaesuTransceiverDevices
]
