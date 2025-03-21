import { SerialPort } from "serialport"
import { SerialPortDriver } from "../src/communication-drivers/node/SerialPortDriver"
import { FT891Driver } from "../src/device-drivers/transceivers/yaesu/FT891Driver"
import { TransceiverVFOType } from "../src/device-drivers/transceivers/base/TransceiverVFOType"

const serialPort = new SerialPort({
  path: "/dev/tty.SLAB_USBtoUART",
  baudRate: 4800,
})

const serialPortDriver = new SerialPortDriver(serialPort)
const ft891 = new FT891Driver(serialPortDriver);

serialPort.on("open", async () => { // NOTE: it's important to wait for this port to be open, otherwise you might run into write timeout from NodeSerialPort
  console.log({ vfo: await ft891.sendCommand("getVFO", { vfo: TransceiverVFOType.A }) })

  await ft891.sendCommand("setVFO", { frequency: 14_250_300, vfo: TransceiverVFOType.A })
  console.log({ vfo: await ft891.sendCommand("getVFO", { vfo: TransceiverVFOType.A }) })

  serialPort.close()
})
