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
  onChange: (configuration: Configuration) => void
}

export const ConfigureCommunicationDriver = ({ configuration, onChange }: Props) => {
  const handleDriverTypeChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => onChange(DEFAULT_DRIVER_CONFIGURATIONS[value]), [onChange])

  return <>
    <h2>Communication Driver</h2>

    <select className="margin-bottom--md" id="communicationDriverType" onChange={handleDriverTypeChange} value={configuration.type}>
      {Object.values(DriverType).map((type) => <option key={type} value={type}>{DriverTypeLabels[type]}</option>)}
    </select>

    <div>
      {configuration?.type === DriverType.CP210x && <CP210x configuration={configuration} onChange={onChange} />}
    </div>

  </>
}
