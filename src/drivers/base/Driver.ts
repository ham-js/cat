import { map, Observable } from "rxjs"
import { DriverType } from "./DriverType"

export abstract class Driver {
  abstract readonly type: DriverType
  abstract readonly data: Observable<Uint8Array>
  abstract write(data: Uint8Array): void | Promise<void>

  protected textEncoder = new TextEncoder()

  get isOpen(): boolean {
    return true
  }

  open?(): Promise<void>
  close?(): void | Promise<void>

  public stringData(encoding: string = "utf-8", options: TextDecoderOptions = {}): Observable<string> {
    const textDecoder = new TextDecoder(encoding, options)

    return this.data
      .pipe(
        map((byteArray) => textDecoder.decode(byteArray))
      )
  }

  public writeString(data: string): void | Promise<void> {
    return this.write(this.textEncoder.encode(data))
  }
}
