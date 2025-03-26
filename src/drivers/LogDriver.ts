import { Observable, share, Subject, Subscription } from "rxjs";
import { Driver } from "./base/Driver";
import { DriverType } from "./base/DriverType";

export type DriverLog = ({
  data: Uint8Array,
  type: "read" | "write"
} | {
  type: "open"
} | {
  type: "close"
}) & {
  timestamp: Date
}

export class LogDriver extends Driver {
  readonly type: DriverType;
  protected _log = new Subject<DriverLog>()
  log = this._log.asObservable()
    .pipe(
      share()
    )
  observable: Observable<Uint8Array>
  protected _observableSubscription?: Subscription

  constructor(public readonly driver: Driver) {
    super()

    this.observable = this.driver.observable
    this.type = driver.type
  }

  get isOpen(): boolean {
    return this.driver.isOpen
  }

  async open(): Promise<void> {
    this._log.next({
      timestamp: new Date(),
      type: "open"
    })

    await this.driver.open?.()

    this._observableSubscription = this.observable.subscribe((data) => this._log.next({
      data,
      timestamp: new Date(),
      type: "read"
    }))
  }

  async close(): Promise<void> {
    this._log.next({
      timestamp: new Date(),
      type: "close"
    })

    this.stopLogging()
    await this.driver.close?.()
  }

  stopLogging() {
    this._observableSubscription?.unsubscribe()
    this._log.complete()
  }

  write(data: Uint8Array): void | Promise<void> {
    this._log.next({
      data,
      timestamp: new Date(),
      type: "write"
    })

    return this.driver.write(data)
  }
}
