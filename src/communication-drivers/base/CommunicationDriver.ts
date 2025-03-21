import { map, Observable } from "rxjs";

export abstract class CommunicationDriver {
  abstract readonly observable: Observable<Uint8Array>
  abstract write(data: Uint8Array): void | Promise<void>

  protected textEncoder = new TextEncoder()

  public stringObservable(encoding: string = "utf-8", options: TextDecoderOptions = {}): Observable<string> {
    const textDecoder = new TextDecoder(encoding, options)

    return this.observable
      .pipe(
        map((byteArray) => textDecoder.decode(byteArray))
      )
  }

  public writeString(data: string): void | Promise<void> {
    return this.write(this.textEncoder.encode(data))
  }
}
