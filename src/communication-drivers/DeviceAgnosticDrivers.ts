import { NotInstantiable } from "../utils/types/NotInstantiable";
import { CommunicationDriver } from "./base/CommunicationDriver";
import { DummyDriver } from "./DummyDriver";
import { SerialPortDriver } from "./node/SerialPortDriver";
import { WebSocketDriver } from "./WebSocketDriver";

export const DeviceAgnosticDrivers: NotInstantiable<typeof CommunicationDriver>[] = [
  DummyDriver,
  SerialPortDriver,
  WebSocketDriver
]
