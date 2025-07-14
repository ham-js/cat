import { map, Observable } from "rxjs"
import { DriverType } from "./DriverType"

/**
 *  A driver connects a device to a real physical device. This is the base class for all drivers.
 */
export abstract class Driver {
  /**
   *  The type of the driver, used for introspection ans validating supported
   *  drivers on devices. Every driver has their own driver type to uniquely
   *  identify it.
   */
  abstract readonly type: DriverType
  /**
   *  This property allows to read data from a real physical device.
   */
  abstract readonly data: Observable<Uint8Array>
  /**
   *  Allows to write data to a real physical device. Use `writeString` if you
   *  want to write a UTF-8 encoded string.
   *  @param {Uint8Array} data The data to be written
   */
  abstract write(data: Uint8Array): void | Promise<void>

  /**
   *  The default text encoder of the driver. Overwrite this for custom string
   *  encodings.
   */
  protected textEncoder = new TextEncoder()

  /**
   *  Returns whether the driver is open for reading and writing.
   *  @returns {boolean} Whether this driver is open
   */
  get isOpen(): boolean {
    return true
  }

  /**
   *  An optional method to open a driver for reading/writing.
   */
  open?(): Promise<void>
  /**
   *  An optional method to close a driver for reading/writing.
   */
  close?(): void | Promise<void>

  /**
   *  Get the data of the driver as utf-8 observable.
   *  @param {string} encoding The encoding of the text decoder used on emissions of the `data` property
   *  @param {object} options Options for the text decoder
   *  @returns {Observable<string>} An observable of strings based on the Uint8Array-based `data` property
   */
  public stringData(encoding: string = "utf-8", options: TextDecoderOptions = {}): Observable<string> {
    const textDecoder = new TextDecoder(encoding, options)

    return this.data
      .pipe(
        map((byteArray) => textDecoder.decode(byteArray))
      )
  }

  /**
   *  Convenience method to write strings instead of bytes to the real physical device.
   *  This method uses the protected `textEncoder` property to encode the input string to bytes.
   *  @param {string} data The data to write
   *  @returns {void|Promise<void>} A promise that resolves after the data was
   *  written, or void if the `write` method doesn't return a promise
   */
  public writeString(data: string): void | Promise<void> {
    return this.write(this.textEncoder.encode(data))
  }
}
