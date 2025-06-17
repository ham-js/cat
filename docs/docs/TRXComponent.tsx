import { useCallback, useState } from "react"
import { VFOType, WebSerialDriver, YaesuGenericTransceiver  } from "@ham-js/cat"

export const TRXComponent = () => {
  const [vfoFrequency, setVFOFrequency] = useState<number>()

  const getVFOFrequency = useCallback(() => {
    (async () => {
      const port = await navigator.serial.requestPort() // you might need to install a driver for your device
      const driver = new WebSerialDriver(port, {baudRate: 4800}) // replace with the correct baud rate of your device
      const device = new YaesuGenericTransceiver(driver)
      await device.open()
      setVFOFrequency(await device.getVFOFrequency({ vfo: VFOType.Current }))
      await device.close()
    })()
  }, [])

  return <>
    <button onClick={getVFOFrequency} type="button">Get VFO Frequency</button>
    <p>VFO Frequency: {vfoFrequency}</p> 
  </>
}
