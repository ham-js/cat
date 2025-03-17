import { Device } from "./base/types/Device";
import { TransceiverDevices } from "./transceivers/TransceiverDevices";

export const Devices: typeof Device<{}>[] = [
  ...TransceiverDevices
]
