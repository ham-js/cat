/**
 *   The different driver types. Every driver class uses its own type. It is
 *   used for introspection and validation of supported drivers on devices at
 *   runtime.
 */
export enum DriverType {
  CP210xWebUSBDriver = "CP210xWebUSBDriver",
  DummyDriver = "DummyDriver",
  SerialPortDriver = "SerialPortDriver",
  WebSerialDriver = "WebSerialDriver",
  WebSocketDriver = "WebSocketDriver"
}
