import { EMPTY } from "rxjs";

import { Driver } from "drivers/base/Driver";
import { DriverType } from "drivers/base/DriverType";

export class DummyDriver extends Driver {
  readonly type = DriverType.DummyDriver

  observable = EMPTY

  write(data: Uint8Array): void | Promise<void> {}
}
