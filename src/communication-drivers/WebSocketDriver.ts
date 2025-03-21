import { firstValueFrom, filter, fromEvent, interval, map, Observable, timeout } from "rxjs";
import { CommunicationDriver } from "./base/CommunicationDriver";

const OPEN_POLLING_INTERVAL = 100
const OPEN_TIMEOUT = 5000

export class WebSocketDriver extends CommunicationDriver {
  readonly observable: Observable<Uint8Array>

  constructor(protected webSocket: WebSocket) {
    super()

    this.observable = fromEvent<MessageEvent>(webSocket, "message")
      .pipe(
        map((event) => {
          if (typeof event.data === "string") return this.textEncoder.encode(event.data)

          return event.data // blob or arraybuffer
        })
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
