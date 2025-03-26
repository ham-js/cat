import { describe, expect, test } from "@jest/globals"
import { Transceiver } from "./Transceiver"
import { DeviceType } from "../../base/DeviceType"

describe("Transceiver", () => {
  test("sets the device vendor", () => expect(Transceiver.deviceType).toBe(DeviceType.Transceiver))
})
