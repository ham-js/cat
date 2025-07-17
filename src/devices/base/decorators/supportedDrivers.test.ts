import { describe, expect, test } from "@jest/globals";
import { supportedDrivers } from "./supportedDrivers";
import { DriverType, DummyDriver } from "../../../drivers";
import { TEST_DRIVER_TYPE, TestDriver } from "../../../test/utils/TestDriver";
import { Device } from "../Device";

@supportedDrivers([
  TEST_DRIVER_TYPE
])
class ParentDevice extends Device {
  static get displayName(): string {
    return "ParentDevice"
  }
}

@supportedDrivers([
  DriverType.DummyDriver
])
class ChildDevice extends ParentDevice {
  static get displayName(): string {
    return "ChildDevice"
  }
}

class OtherChildDevice extends ParentDevice {
  static get displayName(): string {
    return "OtherChildDevice"
  }
}

describe("supportedDrivers", () => {
  test("it returns the right supported drivers", () => {
    expect(ParentDevice.supportedDrivers).toEqual([TEST_DRIVER_TYPE])
    expect(ChildDevice.supportedDrivers).toEqual([DriverType.DummyDriver])
    expect(OtherChildDevice.supportedDrivers).toEqual([TEST_DRIVER_TYPE])
  })

  test("it checks if the driver is supported", () => {
    expect(() => new ParentDevice(new DummyDriver())).toThrow("This device doesn't support the driver DummyDriver (supported drivers: [TEST_DRIVER])")
    expect(() => new ParentDevice(new TestDriver())).not.toThrow()
  })

  test("it allows child classes to overwrite the supported drivers", () => {
    expect(() => new ChildDevice(new DummyDriver())).not.toThrow()
    expect(() => new ChildDevice(new TestDriver())).toThrow("This device doesn't support the driver TEST_DRIVER (supported drivers: [DummyDriver])")
  })

  test("it defaults to the parent class supported drivers if the child does not overwrite the supported drivers", () => {
    expect(() => new OtherChildDevice(new DummyDriver())).toThrow("This device doesn't support the driver DummyDriver (supported drivers: [TEST_DRIVER])")
    expect(() => new OtherChildDevice(new TestDriver())).not.toThrow()
  })
})
