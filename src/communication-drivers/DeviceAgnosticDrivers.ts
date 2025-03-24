import { NonInstantiable } from "../utils/types/NonInstantiable";
import { CommunicationDriver } from "./base/CommunicationDriver";
import { DummyDriver } from "./DummyDriver";
import { SerialPortDriver } from "./node/SerialPortDriver";
import { WebSocketDriver } from "./WebSocketDriver";

export const DeviceAgnosticDrivers: NonInstantiable<typeof CommunicationDriver>[] = [
  DummyDriver,
  SerialPortDriver,
  WebSocketDriver
]
