import { SerialPort } from "serialport"
import { NodeSerialPort } from "../src/drivers/NodeSerialPort"
import { FT891 } from "../src/devices/transceivers/yaesu/FT891"
import { TransceiverVFOType } from "../src/devices/transceivers/base/TransceiverVFOType"

const serialPort = new SerialPort({
  path: "/dev/tty.SLAB_USBtoUART",
  baudRate: 4800,
})

const nodeSerialPort = new NodeSerialPort(serialPort)
const ft891 = new FT891(nodeSerialPort);

serialPort.on("open", async () => { // NOTE: it's important to wait for this port to be open, otherwise you might run into write timeout from NodeSerialPort
  console.log({ vfo: await ft891.sendCommand("getVFO", { vfo: TransceiverVFOType.A }) })

  await ft891.sendCommand("setVFO", { frequency: 14_250_300, vfo: TransceiverVFOType.A })
  console.log({ vfo: await ft891.sendCommand("getVFO", { vfo: TransceiverVFOType.A }) })

  serialPort.close()
})
