import { EMPTY } from "rxjs";
import { Driver } from "./base/Driver";
import { DriverType } from "./base/DriverType";

/**
 * A dummy driver that never reads any data and that doesn't write anything.
 */
export class DummyDriver extends Driver {
  readonly type = DriverType.DummyDriver

  data = EMPTY

  write(data: Uint8Array): void | Promise<void> {}
}
