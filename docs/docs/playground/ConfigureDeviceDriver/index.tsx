import { TransceiverDevices } from "../../../../src/device-drivers/transceivers/TransceiverDevices"

export enum DriverType {
  ICOMGeneric = 'ICOMGeneric',
  KenwoodGeneric = 'KenwoodGeneric',
  YaesuGeneric = 'YaesuGeneric',
}

export type Configuration =
  {type: DriverType.ICOMGeneric, deviceAddress: number} |
  {type: DriverType.KenwoodGeneric} |
  {type: DriverType.YaesuGeneric}

export const DEFAULT_DRIVER_CONFIGURATIONS = {
  [DriverType.ICOMGeneric]: {deviceAddress: 0xE0, type: DriverType.ICOMGeneric},
  [DriverType.KenwoodGeneric]: {type: DriverType.KenwoodGeneric},
  [DriverType.YaesuGeneric]: {type: DriverType.YaesuGeneric},
} as const

export const ConfigureDeviceDriver = () => {
  return <>
    <h2>Device Driver</h2>

    <select className="margin-bottom--md">
      {TransceiverDevices.map((transceiverDevice) => <option key={`${transceiverDevice.deviceVendor}${transceiverDevice.deviceName}`}>{transceiverDevice.deviceVendor} {transceiverDevice.deviceName}</option>)}
    </select>
  </>
}
