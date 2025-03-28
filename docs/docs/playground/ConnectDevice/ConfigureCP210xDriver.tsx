import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { DriverFactory } from "./ChooseDriver"
import { CP210xWebUSBDriver } from "@ham-js/cat"

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
  disabled: boolean
  onDriverFactoryChange: (createDriverFactory: DriverFactory) => void
}

export const ConfigureCP210xDriver = ({ disabled, onDriverFactoryChange }: Props) => {
  const [baudRate, setBaudRate] = useState(4800)

  const handleBaudRateChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => setBaudRate(parseInt(value, 10)), [])

  useEffect(() => {
    onDriverFactoryChange(async () => {
      const options = { baudRate }

      try {
        const usbDevice = await navigator.usb.requestDevice({
          filters: CP210xWebUSBDriver.deviceFilters
        })

        return new CP210xWebUSBDriver(usbDevice, options)
      } catch(error) {
        console.error(error)

        return
      }
    })
  }, [baudRate, onDriverFactoryChange])

  return <div>
    <div><label htmlFor="baudRate">Baud Rate</label></div>

    <select disabled={disabled} id="baudRate" onChange={handleBaudRateChange} value={baudRate.toString()}>
      {BAUD_RATES.map((baudRate) => <option key={baudRate}>{baudRate}</option>)}
    </select>
  </div>
}
