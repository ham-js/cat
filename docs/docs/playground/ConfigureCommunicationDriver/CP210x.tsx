import { ChangeEvent, useCallback } from "react"
import { Configuration, DriverType } from "."

export const BAUD_RATES = [
  110,
  300,
  600,
  1200,
  2400,
  4800,
  9600,
  14400,
  19200,
  38400,
  57600,
  115200,
  128000,
  256000
]

interface Props {
  configuration: Configuration
  onChange: (configuration: CP210xConfiguration) => void
}

export interface CP210xConfiguration {
  baudRate: number
  type: DriverType.CP210x
}

export const CP210x = ({ configuration, onChange }: Props) => {
  const handleBaudRateChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...configuration,
      baudRate: parseInt(value, 10),
      type: DriverType.CP210x
    })
  }, [configuration, onChange])

  if (configuration.type !== DriverType.CP210x) return null

  return <div>
    <div><label className="text--bold" htmlFor="baudRate">Baud Rate</label></div>
    <select id="baudRate" onChange={handleBaudRateChange} value={configuration.baudRate.toString()}>
      {BAUD_RATES.map((baudRate) => <option key={baudRate}>{baudRate}</option>)}
    </select>
  </div>
}
