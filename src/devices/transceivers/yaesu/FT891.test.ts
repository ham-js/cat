import { describe, expect, test } from "@jest/globals";
import { FT891 } from "./FT891";
import { DeviceAgnosticDriverTypes, DriverType } from "../../../drivers";

describe("FT891", () => {
  test("device name", () => expect(FT891.deviceName).toBe("FT-891"))
  test("supportedDrivers", () => expect(FT891.supportedDrivers).toEqual([DriverType.CP210xWebUSBDriver, ...DeviceAgnosticDriverTypes]))
})
