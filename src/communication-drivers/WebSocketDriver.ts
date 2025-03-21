import { fromEvent, map, Observable } from "rxjs";
import { CommunicationDriver } from "./base/CommunicationDriver";

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

  write(data: Uint8Array): void | Promise<void> {
    this.webSocket.send(data)
  }
}
