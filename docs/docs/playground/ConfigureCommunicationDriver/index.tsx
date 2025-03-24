import { ChangeEvent, useCallback } from "react"
import { CP210x, CP210xConfiguration } from "./CP210x"

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
  disabled?: boolean
  onChange: (configuration: Configuration) => void
}

export const ConfigureCommunicationDriver = ({ configuration, disabled, onChange }: Props) => {
  const handleDriverTypeChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => onChange(DEFAULT_DRIVER_CONFIGURATIONS[value]), [onChange])

  return <>
    <div><label htmlFor="communicationDriverType">Communication Driver</label></div>

    <select className="margin-bottom--md" disabled={disabled} id="communicationDriverType" onChange={handleDriverTypeChange} value={configuration.type}>
      {Object.values(DriverType).map((type) => <option key={type} value={type}>{DriverTypeLabels[type]}</option>)}
    </select>

    <div>
      {configuration?.type === DriverType.CP210x && <CP210x configuration={configuration} disabled={disabled} onChange={onChange} />}
    </div>

  </>
}
