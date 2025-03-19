import { Device } from "./base/Device";
import { TransceiverDevices } from "./transceivers/TransceiverDevices";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Devices: Omit<typeof Device<any>, "()">[] = [
  ...TransceiverDevices
]
