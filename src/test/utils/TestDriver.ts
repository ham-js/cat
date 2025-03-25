import { jest } from "@jest/globals"
import { Subject } from "rxjs"

import { Driver } from "drivers/base/Driver"

export class TestDriver extends Driver {
  private _open = false
  subject = new Subject<Uint8Array>()
  readonly observable = this.subject.asObservable()

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
