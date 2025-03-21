import { jest } from "@jest/globals"
import { Subject } from "rxjs"
import { CommunicationDriver } from "../../communication-drivers/base/CommunicationDriver"

export class TestCommunicationDriver extends CommunicationDriver {
  subject = new Subject<Uint8Array>()
  readonly observable = this.subject.asObservable()

  write = jest.fn<(data: Uint8Array) => void>((data) => this.subject.next(data))
}
