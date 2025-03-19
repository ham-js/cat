import { TransceiverDevice } from "./base/TransceiverDevice";
import { YaesuTransceiverDevices } from "./yaesu/YaesuTransceiverDevices";

export const TransceiverDevices: typeof TransceiverDevice[] = [
  ...YaesuTransceiverDevices
]
