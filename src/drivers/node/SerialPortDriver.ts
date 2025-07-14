import { fromEventPattern, Observable, share } from "rxjs";
import { Driver } from "../base/Driver"
import { SerialPortStream } from "@serialport/stream"
import { DriverType } from "../base/DriverType";

/**
 *  A driver for the [Node SerialPort](https://serialport.io/) library.
 */
export class SerialPortDriver extends Driver {
  readonly type = DriverType.SerialPortDriver

  readonly data: Observable<Uint8Array>

  /**
   * The constructor for the node serial port driver. Make sure to hand in a
   * serial port that is not opened yet and has `autoOpen` set to `false`.
   * @param {SerialPortStream} serialPort A not-yet-open serial port (make sure to set `autoOpen` to `false`.
   * @param {number} timeout A timeout used for writing to the serial port
   */
  constructor(protected serialPort: SerialPortStream, protected timeout = 1000) {
    super()

    this.data = fromEventPattern<Uint8Array>((handler) => {
      this.serialPort.on("data", handler)
    }, (handler) => {
      this.serialPort.removeListener("data", handler)
    })
      .pipe(
        share()
      )
  }

  get isOpen(): boolean {
    return this.serialPort.isOpen
  }

  open(): Promise<void> {
    if (this.isOpen) return Promise.resolve()

    return new Promise((resolve, reject) => {
      this.serialPort.open((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  close(): void | Promise<void> {
    this.serialPort.close()
  }

  async write(data: Uint8Array): Promise<void> {
    const { promise: _promise, reject, resolve } = Promise.withResolvers<void>()

    const timeoutId = setTimeout(() => reject(new Error("Timeout during write")), this.timeout)
    const promise = _promise.finally(() => clearTimeout(timeoutId))

    this.serialPort.write(data, (error) => {
      if (error) reject(error)
    })

    this.serialPort.drain((error) => {
      if (error) reject(error)
      else resolve()
    })

    return promise
  }
}
