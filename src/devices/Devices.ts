import { Device } from "./base/Device";
import { TransceiverDevices } from "./transceivers/TransceiverDevices";

export const Devices: typeof Device<never>[] = [
  ...TransceiverDevices
]
