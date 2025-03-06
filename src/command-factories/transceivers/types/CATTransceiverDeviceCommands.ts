import { CATCommandFactory } from "../../base/types/CATCommandFactory"
import { CATTransceiverDeviceCommandKey } from "../enums/CATTransceiverDeviceCommandFactoryKey"

export type CATTransceiverDeviceCommands = {
  [CATTransceiverDeviceCommandKey.setVFO]: CATCommandFactory<number>
  [CATTransceiverDeviceCommandKey.getVFO]: CATCommandFactory<void>
}
