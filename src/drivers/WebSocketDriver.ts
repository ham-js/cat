import { firstValueFrom, filter, fromEvent, interval, map, Observable, timeout, share, mergeMap } from "rxjs";
import { Driver } from "./base/Driver";
import { DriverType } from "./base/DriverType";

const OPEN_POLLING_INTERVAL = 100
const OPEN_TIMEOUT = 5000

export class WebSocketDriver extends Driver {
  readonly type = DriverType.WebSocketDriver
  readonly data: Observable<Uint8Array>

  constructor(protected webSocket: WebSocket) {
    super()

    // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event
    this.data = fromEvent<MessageEvent>(webSocket, "message")
      .pipe(
        mergeMap((event) => {
          if (typeof event.data === "string") return Promise.resolve(this.textEncoder.encode(event.data))
          if (event.data instanceof Blob) return event.data.arrayBuffer().then((arrayBuffer) => new Uint8Array(arrayBuffer))

          return Promise.resolve(new Uint8Array(event.data))
        }),
        share()
      )
  }

  get isOpen(): boolean {
    return this.webSocket.readyState === WebSocket.OPEN
  }

  open(): Promise<void> {
    if (this.isOpen) return Promise.resolve()
    else return firstValueFrom(
      interval(OPEN_POLLING_INTERVAL).pipe(
        map(() => this.isOpen),
        filter(Boolean),
        map(() => void 0),
        timeout(OPEN_TIMEOUT)
      )
    )
  }

  close() {
    this.webSocket.close()
  }

  write(data: Uint8Array): void | Promise<void> {
    this.webSocket.send(data)
  }
}
