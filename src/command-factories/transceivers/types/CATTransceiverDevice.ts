import { CATDeviceType } from "../../base/enums/CATDeviceType"
import { CATDeviceCommandFactory } from "../../base/types/CATDeviceCommandFactory"
import { CATTransceiverDeviceCommandKey } from "../enums/CATTransceiverDeviceCommandFactoryKey"
import { CATTransceiverDeviceCommands } from "./CATTransceiverDeviceCommands"

export interface CATTransceiverDeviceCommandFactory<C extends CATTransceiverDeviceCommandKey[]> extends CATDeviceCommandFactory {
  commands: {[key in C[number]]: CATTransceiverDeviceCommands[key]}
  deviceType: CATDeviceType
}
