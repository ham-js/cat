import { DeviceDriver } from "./base/DeviceDriver";
import { TransceiverDevices } from "./transceivers/TransceiverDevices";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DeviceDrivers: Omit<typeof DeviceDriver<any>, "()">[] = [
  ...TransceiverDevices
]
