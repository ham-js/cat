import { supportedDrivers } from "../../devices/base/decorators/supportedDrivers"
import { TEST_DRIVER_TYPE } from "./TestDriver"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTestDevice = <D extends new (...parameters: any[]) => any>(Original: D): D => {
  @supportedDrivers([TEST_DRIVER_TYPE])
  class DecoratedClass extends Original {}

  return DecoratedClass
}
