import { describe, expect, test } from "@jest/globals";
import { FT991 } from "devices/transceivers/yaesu/FT991";
import { DeviceAgnosticDriverTypes } from "drivers/base/DeviceAgnosticDriverTypes";
import { DriverType } from "drivers/base/DriverType";

describe("FT991", () => {
  test("device name", () => expect(FT991.deviceName).toBe("FT-991"))
  test("supportedDrivers", () => expect(FT991.supportedDrivers).toEqual([DriverType.CP210xWebUSBDriver, ...DeviceAgnosticDriverTypes]))
})
