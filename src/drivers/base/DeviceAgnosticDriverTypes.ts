import { DriverType } from "drivers/base/DriverType";

export const DeviceAgnosticDriverTypes: DriverType[] = [
  DriverType.DummyDriver,
  DriverType.SerialPortDriver,
  DriverType.WebSocketDriver,
]
