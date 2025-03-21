import { useCallback, useState } from "react"

import { CP210xDriver } from "../../../src/communication-drivers/browser/web-usb/CP210xDriver"
import { FT891Driver } from "../../../src/device-drivers/transceivers/yaesu/FT891Driver"
import { TransceiverVFOType } from "../../../src/device-drivers/transceivers/base/TransceiverVFOType"

export const Playground = () => {
  const [serialPort, setSerialPort] = useState<CP210xDriver>()

  const handleSetVFO = useCallback(() => {
    const setVFO = async () => {
      if (!serialPort) return

      const ft891 = new FT891Driver(serialPort)

      console.log("VFO A was: ", await ft891.sendCommand("getVFO", { vfo: TransceiverVFOType.A }))
      await ft891.sendCommand("setVFO", { frequency: 14_250_300, vfo: TransceiverVFOType.A })
      console.log("VFO A now is: ", await ft891.sendCommand("getVFO", { vfo: TransceiverVFOType.A }))
    }

    setVFO()
  }, [serialPort])

  const handleToggleConnect = useCallback(() => {
    const handleConnect = async () => {
      const usbDevice = await navigator.usb.requestDevice({ filters: CP210xDriver.deviceFilters })
      const newSerialPort = new CP210xDriver(usbDevice, {baudRate: 4800})

      await newSerialPort.open()
      setSerialPort(newSerialPort)
    }

    const handleDisconnect = async () => {
      if (!serialPort) return

      await serialPort.close()

      setSerialPort(undefined)
    }

    if (serialPort) handleDisconnect()
    else handleConnect()
  }, [serialPort])

  return <>
    <button onClick={handleToggleConnect} type="button">{serialPort ? "Disconnect" : "Connect"}</button>
    <button disabled={!serialPort} onClick={handleSetVFO} type="button">Set VFO A to 14.250.300</button>
  </>
}
