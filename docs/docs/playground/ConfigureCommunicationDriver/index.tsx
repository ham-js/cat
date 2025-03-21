import { CommunicationDriver } from "../../../../src/communication-drivers/base/CommunicationDriver"
import { ChangeEvent, useCallback, useState } from "react"
import { CP210x, CP210xConfiguration } from "./CP210x"

export enum DriverType {
  CP210x = "cp210x",
  WebSocket = "websocket"
}

const DriverTypeLabels: Record<DriverType, string> = {
  [DriverType.CP210x]: "CP210x (WebUSB)",
  [DriverType.WebSocket]: "Web Socket",
}

export type Configuration = CP210xConfiguration & { type: DriverType }

export const DEFAULT_DRIVER_CONFIGURATIONS = {
  [DriverType.CP210x]: {
    baudRate: 9600,
    type: DriverType.CP210x
  }
}

interface Props {
  configuration: Configuration
  onChange: (configuration: Configuration) => void
}

export const ConfigureCommunicationDriver = ({ configuration, onChange }: Props) => {
  const [driverConfiguration, setDriverConfiguration] = useState<Configuration>(DEFAULT_DRIVER_CONFIGURATIONS[DriverType.CP210x])
  const handleDriverConfigurationChange = useCallback((configuration: Configuration) => setDriverConfiguration(configuration), [])
  const handleDriverTypeChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => setDriverConfiguration(DEFAULT_DRIVER_CONFIGURATIONS[value]), [])

  return <>
    <h2>Communication Driver</h2>

    <select className="margin-bottom--md" id="communicationDriverType" onChange={handleDriverTypeChange}>
      {Object.values(DriverType).map((type) => <option key={type} value={type}>{DriverTypeLabels[type]}</option>)}
    </select>

    <div>
      {driverConfiguration?.type === DriverType.CP210x && <CP210x configuration={driverConfiguration} onChange={handleDriverConfigurationChange} />}
    </div>

  </>
}
