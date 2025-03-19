import { Device } from "./base/Device";
import { TransceiverDevices } from "./transceivers/TransceiverDevices";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Devices: typeof Device<any>[] = [
  ...TransceiverDevices
]
