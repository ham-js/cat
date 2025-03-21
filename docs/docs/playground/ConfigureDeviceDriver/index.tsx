import { ChangeEvent, useCallback, useState } from "react"
import { TransceiverDriver } from "../../../../src/device-drivers/transceivers/base/TransceiverDriver"
import { GenericDriver as ICOMGenericDriver } from "../../../../src/device-drivers/transceivers/icom/GenericDriver"
import { GenericDriver as KenwoodGenericDriver } from "../../../../src/device-drivers/transceivers/kenwood/GenericDriver"
import { GenericDriver as YaesuGenericDriver } from "../../../../src/device-drivers/transceivers/yaesu/GenericDriver"

export enum DriverType {
  ICOMGeneric = 'ICOMGeneric',
  KenwoodGeneric = 'KenwoodGeneric',
  YaesuGeneric = 'YaesuGeneric',
}

const DriverMap: Record<DriverType, Omit<typeof TransceiverDriver, "()">> = {
  [DriverType.ICOMGeneric]: ICOMGenericDriver,
  [DriverType.KenwoodGeneric]: KenwoodGenericDriver,
  [DriverType.YaesuGeneric]: YaesuGenericDriver,
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

interface Props {
  configuration: Configuration
  onChange: (configuration: Configuration) => void
}

export const ConfigureDeviceDriver = ({ configuration, onChange }: Props) => {
  const handleDriverTypeChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => onChange(DEFAULT_DRIVER_CONFIGURATIONS[value]), [onChange])

  return <>
    <h2>Device Driver</h2>

    <select className="margin-bottom--md" onChange={handleDriverTypeChange} value={configuration.type}>
      {Object.values(DriverType).map((driverType) => <option key={driverType} value={driverType}>{DriverMap[driverType].deviceVendor} {DriverMap[driverType].deviceName}</option>)}
    </select>
  </>
}
