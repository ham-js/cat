import { TransceiverDevice } from "./base/types/TransceiverDevice";
import { YaesuTransceiverDevices } from "./yaesu/YaesuTransceiverDevices";

export const TransceiverDevices: typeof TransceiverDevice[] = [
  ...YaesuTransceiverDevices
]
