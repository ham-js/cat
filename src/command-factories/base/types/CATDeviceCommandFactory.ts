import { CATDeviceType } from "../enums/CATDeviceType"
import { CATCommandFactory } from "./CATCommandFactory"

export type CATDeviceCommandFactory = {
  commands: Record<string, CATCommandFactory<any>> // this is *something* we can call; doesn't matter here what
  deviceType: CATDeviceType
  deviceName: string
}
