import { EMPTY } from "rxjs";
import { CommunicationDriver } from "./base/CommunicationDriver";

export class DummyDriver extends CommunicationDriver {
  observable = EMPTY

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(data: Uint8Array): void | Promise<void> {}
}
