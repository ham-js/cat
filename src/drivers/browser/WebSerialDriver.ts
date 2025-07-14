import { Observable, share } from "rxjs";
import { Driver } from "../base/Driver";
import { DriverType } from "../base/DriverType";

/**
 *  A [WebSerial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) based driver for Chromium browsers.
 */
export class WebSerialDriver extends Driver {
  private reader: ReadableStreamDefaultReader | null = null

  data: Observable<Uint8Array<ArrayBufferLike>>
  type = DriverType.WebSerialDriver

  get isOpen(): boolean {
    return this.serialPort.connected
  }

  /**
   *  The constructor for the web serial driver
   *  @param {object} serialPort a serial port returned by [requestPort](https://developer.mozilla.org/en-US/docs/Web/API/Serial/requestPort)
   *  @param {object} options Options used for [opening](https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open) the serial port (such as `baudRate`)
   */
  constructor(protected serialPort: SerialPort, protected options: SerialOptions) {
    super()

    this.data = new Observable<Uint8Array>((subscriber) => {
      const startReading = async () => {
        while (!subscriber.closed && serialPort.readable) {
          this.reader = serialPort.readable.getReader()

          try {
            while (true) {
              const { value, done } = await this.reader.read()
              if (done) break

              subscriber.next(value)
            }
          } catch(error) {
            subscriber.error(error)

            break
          } finally {
            this.reader.releaseLock()
          }
        }
      }

      startReading()
    }).pipe(share())
  }

  open(): Promise<void> {
    return this.serialPort.open(this.options)
  }

  async close(): Promise<void> {
    await this.reader?.cancel()

    return this.serialPort.close()
  }

  async write(data: Uint8Array): Promise<void> {
    const writer = this.serialPort.writable?.getWriter()

    if (!writer) throw new Error("Could not write to serial port")

    await writer.write(data) 

    writer.releaseLock()
  }
}
