import { DeviceVendor } from "../../../src/devices/base/types/DeviceVendor";
import { TransceiverDeviceVendor } from "../../../src/devices/transceivers/base/enums/TransceiverDeviceVendor";

export const DeviceVendors: Record<DeviceVendor, string> = {
  [TransceiverDeviceVendor.Yaesu]: "Yaesu"
}
