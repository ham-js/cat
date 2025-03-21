import { Observable, map, share } from "rxjs";
import { WebUSBDriver } from "./base/WebUSBDriver";

enum ControlCommands {
  InterfaceEnable = 0x00,
  SetBaudRate = 0x1E,
  SetModemHandshakeStates = 0x07
}

enum ModemHandshakeStateBitMask {
  DTR = 0b0100000001,
  RTS = 0b1000000010
}

export class CP210xDriver extends WebUSBDriver {
  static deviceFilters = [
    0xEA60,
    0xEA61,
    0xEA63,
    0xEA70,
    0xEA71
  ].map((productId) => ({ productId, vendorId: 0x10C4 }))

  readonly observable: Observable<Uint8Array>

  constructor(protected usbDevice: USBDevice, protected options: { baudRate: number }) {
    super(usbDevice)

    this.observable = new Observable<USBInTransferResult>((subscriber) => {
      const startReading = async () => {
        while (!subscriber.closed) subscriber.next(await this.usbDevice.transferIn(1, 64))
      }

      startReading()
    }).pipe(
      map(({ data }) => new Uint8Array(data ? Array(data.byteLength).fill(0).map((_, i) => data.getUint8(i)) : [])),
      share()
    )
  }

  async write(data: Uint8Array) {
    await this.usbDevice.transferOut(1, data)
  }

  async open(): Promise<void> {
    await super.open()

    if (!this.usbDevice.configuration) await this.usbDevice.selectConfiguration(0)
    await this.usbDevice.claimInterface(this.usbDevice.configuration!.interfaces[0]!.interfaceNumber)

    await this.enableInterface()
    await this.setBaudRate(this.options.baudRate) 
    await this.configureModemHandshakeStates()
  }

  protected async setBaudRate(baudRate: number) {
    await this.usbDevice.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: ControlCommands.SetBaudRate,
      index: 0,
      value: 0,
    }, new Uint32Array([baudRate]));
  }

  protected async enableInterface() {
    await this.usbDevice.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: ControlCommands.InterfaceEnable,
      index: 0,
      value: 0b1,
    });
  }

  protected async configureModemHandshakeStates() {
    await this.usbDevice.controlTransferOut({
      requestType: 'vendor',
      recipient: 'device',
      request: ControlCommands.SetModemHandshakeStates,
      index: 0,
      value: ModemHandshakeStateBitMask.DTR | ModemHandshakeStateBitMask.RTS,
    });
  }
}
