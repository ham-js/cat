import { TransceiverDevice } from "./base/types/TransceiverDevice";
import { YaesuTransceiverDevices } from "./yaesu/YaesuTransceiverDevices";

export const TransceiverDevices: TransceiverDevice[] = [
  ...YaesuTransceiverDevices
]
