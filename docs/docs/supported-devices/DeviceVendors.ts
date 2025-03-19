import { DeviceVendor } from "../../../src/devices/base/DeviceVendor";
import { TransceiverDeviceVendor } from "../../../src/devices/transceivers/base/TransceiverDeviceVendor";

export const DeviceVendors: Record<DeviceVendor, string> = {
  [TransceiverDeviceVendor.ICOM]: "ICOM",
  [TransceiverDeviceVendor.Yaesu]: "Yaesu"
}
