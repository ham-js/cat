import { TransceiverDevice } from "../../../base/types/TransceiverDevice";
import { TransceiverDeviceVendor } from "../../../base/types/TransceiverDeviceVendor";

export abstract class YaesuTransceiverDevice extends TransceiverDevice {
  static readonly deviceVendor = TransceiverDeviceVendor.Yaesu
}
