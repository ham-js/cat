import { ChangeEvent, useCallback, useEffect, useMemo } from "react"
import { CP210x, CP210xConfiguration } from "./CP210x"
import { DriverType as DeviceDriverType, Configuration as DeviceDriverConfiguration } from '../ConfigureDeviceDriver'
import { GenericDriver as ICOMGenericDriver } from "../../../../src/device-drivers/transceivers/icom/GenericDriver"
import { GenericDriver as KenwoodGenericDriver } from "../../../../src/device-drivers/transceivers/kenwood/GenericDriver"
import { GenericDriver as YaesuGenericDriver } from "../../../../src/device-drivers/transceivers/yaesu/GenericDriver"
import { VirtualDriver } from "../../../../src/device-drivers/transceivers/VirtualDriver"
import { NonInstantiable } from "../../../../src/utils/types/NonInstantiable"
import { TransceiverDriver } from "../../../../src/device-drivers/transceivers/base/TransceiverDriver"
import { CommunicationDriver } from "../../../../src/communication-drivers/base/CommunicationDriver"
import { CP210xDriver } from "../../../../src/communication-drivers/browser/web-usb/CP210xDriver"
import { DummyDriver } from "../../../../src/communication-drivers/DummyDriver"
import { WebSocketDriver } from "../../../../src/communication-drivers/WebSocketDriver"

export enum DriverType {
  CP210x = "cp210x",
  Dummy = "dummy",
  WebSocket = "websocket"
}

const DriverTypeLabels: Record<DriverType, string> = {
  [DriverType.CP210x]: "CP210x (WebUSB)",
  [DriverType.Dummy]: "Dummy",
  [DriverType.WebSocket]: "Web Socket",
}

const DriverTypeDrivers: Record<DeviceDriverType, NonInstantiable<typeof TransceiverDriver>> = {
  [DeviceDriverType.ICOMGeneric]: ICOMGenericDriver,
  [DeviceDriverType.KenwoodGeneric]: KenwoodGenericDriver,
  [DeviceDriverType.Virtual]: VirtualDriver,
  [DeviceDriverType.YaesuGeneric]: YaesuGenericDriver
}

const driverTypeMap = (() => {
  const map = new Map<NonInstantiable<typeof CommunicationDriver>, DriverType>()

  map.set(DummyDriver, DriverType.Dummy)
  map.set(WebSocketDriver, DriverType.WebSocket)
  map.set(CP210xDriver, DriverType.CP210x)

  return map
})()

export type Configuration = CP210xConfiguration & { type: DriverType.CP210x } | { type: DriverType.Dummy }

export const DEFAULT_DRIVER_CONFIGURATIONS = {
  [DriverType.CP210x]: {
    baudRate: 9600,
    type: DriverType.CP210x
  } as const,
  [DriverType.Dummy]: {
    type: DriverType.Dummy
  } as const
}

interface Props {
  configuration: Configuration
  deviceDriverConfiguration: DeviceDriverConfiguration
  disabled?: boolean
  onChange: (configuration: Configuration) => void
}

export const ConfigureCommunicationDriver = ({ configuration, deviceDriverConfiguration, disabled, onChange }: Props) => {
  const handleDriverTypeChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => onChange(DEFAULT_DRIVER_CONFIGURATIONS[value]), [onChange])

  const supportedDriverTypes = useMemo(() => 
    DriverTypeDrivers[deviceDriverConfiguration.type].supportedCommunicationDrivers.map((driver) => driverTypeMap.get(driver)).filter(Boolean)
  , [deviceDriverConfiguration])

  useEffect(() => {
    if (supportedDriverTypes.includes(configuration.type)) return

    onChange(DEFAULT_DRIVER_CONFIGURATIONS[supportedDriverTypes[0]]) 
  }, [configuration, onChange, supportedDriverTypes])

  return <>
    <div><label htmlFor="communicationDriverType">Communication Driver</label></div>

    <select className="margin-bottom--md" disabled={disabled} id="communicationDriverType" onChange={handleDriverTypeChange} value={configuration.type}>
      {supportedDriverTypes.map((type) => <option key={type} value={type}>{DriverTypeLabels[type]}</option>)}
    </select>

    <div>
      {configuration?.type === DriverType.CP210x && <CP210x configuration={configuration} disabled={disabled} onChange={onChange} />}
    </div>

  </>
}
