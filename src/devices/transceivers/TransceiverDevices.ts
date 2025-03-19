import { TransceiverDevice } from "./base/TransceiverDevice";
import { ICOMTransceiverDevices } from "./icom/ICOMTransceiverDevices";
import { YaesuTransceiverDevices } from "./yaesu/YaesuTransceiverDevices";

export const TransceiverDevices: Omit<typeof TransceiverDevice, "()">[] = [
  ...ICOMTransceiverDevices,
  ...YaesuTransceiverDevices
]
