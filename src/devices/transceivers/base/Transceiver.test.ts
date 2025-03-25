import { describe, expect, test } from "@jest/globals"

import { Transceiver } from "devices/transceivers/base/Transceiver"
import { DeviceType } from "devices/base/DeviceType"

describe("Transceiver", () => {
  test("sets the device vendor", () => expect(Transceiver.deviceType).toBe(DeviceType.Transceiver))
})
