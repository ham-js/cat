import { SerialPort } from "serialport"
import { SerialPortDriver } from "../src/drivers";
import { FT891 } from "../src/devices/transceivers/yaesu/FT891";
import { VFOType } from "../src/devices";

const serialPort = new SerialPort({
  autoOpen: false,
  path: "/dev/tty.SLAB_USBtoUART",
  baudRate: 4800,
})

const serialPortDriver = new SerialPortDriver(serialPort)
const ft891 = new FT891(serialPortDriver);

(async () => {
  await ft891.open()

  console.log({ vfo: await ft891.getVFO({ vfo: VFOType.A }) })

  await ft891.setVFO({ frequency: 14_250_300, vfo: VFOType.A })
  console.log({ vfo: await ft891.getVFO({ vfo: VFOType.A }) })

  await ft891.close()
})()
