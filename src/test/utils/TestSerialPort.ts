import { jest } from "@jest/globals"
import { Subject } from "rxjs"
import { SerialPort } from "../../devices/base/SerialPort"

export class TestSerialPort extends SerialPort {
  subject = new Subject<Uint8Array>()
  readonly observable = this.subject.asObservable()

  write = jest.fn<(data: Uint8Array) => void>()
}
