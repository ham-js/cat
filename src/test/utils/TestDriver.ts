import { jest } from "@jest/globals"
import { Subject } from "rxjs"
import { Driver } from "../../drivers/base/Driver"
import { DriverType } from "../../drivers/base/DriverType"

export const TEST_DRIVER_TYPE = "TEST_DRIVER" as DriverType

export class TestDriver extends Driver {
  readonly type = TEST_DRIVER_TYPE

  private _open = false
  subject = new Subject<Uint8Array>()
  readonly data = this.subject.asObservable()

  write = jest.fn<(data: Uint8Array) => void>((data) => this.subject.next(data))

  get isOpen(): boolean {
    return this._open
  }

  open = jest.fn(() => {
    this._open = true

    return Promise.resolve()
  })

  close = jest.fn(() => {
    this._open = false

    return Promise.resolve()
  })
}
