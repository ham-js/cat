import { DummyDriver } from "drivers/DummyDriver";
import { SerialPortDriver } from "drivers/node/SerialPortDriver";
import { WebSocketDriver } from "drivers/WebSocketDriver";

export const DeviceAgnosticDrivers = [
  DummyDriver,
  SerialPortDriver,
  WebSocketDriver
]
