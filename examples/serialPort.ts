import { SerialPort } from "serialport"
import { SerialPortDriver, YaesuGenericTransceiver,  VFOType } from "@ham-js/cat"

const serialPort = new SerialPort({
  autoOpen: false,
  path: "/dev/tty.SLAB_USBtoUART5", // replace with your serial port
  baudRate: 4800, // replace with the correct baudRate for your trx
})

const serialPortDriver = new SerialPortDriver(serialPort)
const device = new YaesuGenericTransceiver(serialPortDriver);

(async () => {
  await device.open()

  console.log({ vfo: await device.getVFOFrequency({ vfo: VFOType.Current }) })

  await device.setVFOFrequency({ frequency: 14_250_300, vfo: VFOType.Current })
  console.log({ vfo: await device.getVFOFrequency({ vfo: VFOType.Current }) })

  console.log("Listening to events from TRX")
  device.events.subscribe(console.log)
  process.on("SIGINT", async () => await device.close())
})()
