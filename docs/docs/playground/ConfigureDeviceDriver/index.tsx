import { ChangeEvent, useCallback, useState } from "react"
import { TransceiverDriver } from "../../../../src/device-drivers/transceivers/base/TransceiverDriver"
import { GenericDriver as ICOMGenericDriver } from "../../../../src/device-drivers/transceivers/icom/GenericDriver"
import { GenericDriver as KenwoodGenericDriver } from "../../../../src/device-drivers/transceivers/kenwood/GenericDriver"
import { GenericDriver as YaesuGenericDriver } from "../../../../src/device-drivers/transceivers/yaesu/GenericDriver"
import { VirtualDriver } from "../../../../src/device-drivers/transceivers/VirtualDriver"
import { TransceiverDevices } from "../../../../src/device-drivers/transceivers/TransceiverDevices"
import { DeviceDriverInfo } from "../../../../src/device-drivers/base/DeviceDriverInfo"

export enum DriverType {
  ICOMGeneric = 'ICOMGeneric',
  KenwoodGeneric = 'KenwoodGeneric',
  YaesuGeneric = 'YaesuGeneric',
  Virtual = 'Virtual'
}

const DriverMap: Record<DriverType, Omit<typeof TransceiverDriver, "()">> = {
  [DriverType.ICOMGeneric]: ICOMGenericDriver,
  [DriverType.KenwoodGeneric]: KenwoodGenericDriver,
  [DriverType.YaesuGeneric]: YaesuGenericDriver,
  [DriverType.Virtual]: VirtualDriver,
}

export type Configuration =
  {type: DriverType.ICOMGeneric, deviceAddress: number} |
  {type: DriverType.KenwoodGeneric} |
  {type: DriverType.YaesuGeneric} |
  {type: DriverType.Virtual}

export const DEFAULT_DRIVER_CONFIGURATIONS = {
  [DriverType.ICOMGeneric]: {deviceAddress: 0xE0, type: DriverType.ICOMGeneric},
  [DriverType.KenwoodGeneric]: {type: DriverType.KenwoodGeneric},
  [DriverType.Virtual]: {type: DriverType.Virtual},
  [DriverType.YaesuGeneric]: {type: DriverType.YaesuGeneric},
} as const

const getKey = ({ deviceName }: DeviceDriverInfo): string => {
  return deviceName
}

interface Props {
  configuration: Configuration
  disabled?: boolean
  onChange: (configuration: Configuration) => void
}

export const ConfigureDeviceDriver = ({ configuration, disabled, onChange }: Props) => {
  const [selectedDevice, setSelectedDevice] = useState<typeof TransceiverDevices[number]>()
  const handleSelectDeviceDriver = useCallback((device: typeof TransceiverDevices[number]) => () => {
    setSelectedDevice(device)

    new selectedDevice(null as any, 1, 2)
  }, [])

  return <>
    <div><label htmlFor="deviceDriverType">Device Driver</label></div>

    <select className="margin-bottom--md" disabled={disabled} id="deviceDriverType">
      {TransceiverDevices.map((device) => <option key={getKey(device)} onSelect={handleSelectDeviceDriver(device)} selected={selectedDevice === device}>{device.deviceVendor} {device.deviceName}</option>)}
    </select>
  </>
}
