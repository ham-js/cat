import { EMPTY } from "rxjs";

import { Driver } from "drivers/base/Driver";

export class DummyDriver extends Driver {
  observable = EMPTY

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(data: Uint8Array): void | Promise<void> {}
}
