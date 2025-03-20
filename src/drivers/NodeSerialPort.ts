import { fromEventPattern, Observable, share } from "rxjs";
import { SerialPort as BaseSerialPort } from "../devices/base/SerialPort"
import { SerialPortStream } from "@serialport/stream"

export class NodeSerialPort extends BaseSerialPort {
  readonly observable: Observable<Uint8Array>

  constructor(protected serialPort: SerialPortStream, protected timeout = 1000) {
    super()

    this.observable = fromEventPattern<Uint8Array>((handler) => this.serialPort.on("data", handler))
      .pipe(
        share()
      )
  }

  async write(data: Uint8Array): Promise<void> {
    const { promise: _promise, reject, resolve } = Promise.withResolvers<void>()

    const timeoutId = setTimeout(reject, this.timeout)
    const promise = _promise.finally(() => clearTimeout(timeoutId))

    this.serialPort.write(data, (error) => {
      if (error) reject()
    })

    this.serialPort.drain((error) => {
      if (error) reject()
      else resolve()
    })

    return promise
  }
}
