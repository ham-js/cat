import { describe, expect, test } from "@jest/globals";
import { FT891 } from "./FT891";
import { DeviceType } from "../../base/enums/DeviceType";
import { getJSONSchema } from "../../utils/getJSONSchema";

describe("FT891", () => {
  test("device name", () => expect(FT891.deviceName).toBe("FT-891"))
  test("device type", () => expect(FT891.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(FT891.deviceVendor).toBe("Yaesu"))

  describe("setVFO", () => {
    test("implements the command factory correctly", () => {
      expect(FT891.commands.setVFO({ frequency: 14_250_000, vfo: 0 })).toBe("FA014250000;")
      expect(FT891.commands.setVFO({ frequency: 7_250_000, vfo: 1 })).toBe("FB007250000;")
    })

    test("specifies the parameter type correctly", () => {
      expect(getJSONSchema(FT891.commands.setVFO)).toEqual(
        expect.objectContaining({
          properties: {
            frequency: {
              minimum: 30_000,
              maximum: 56_000_000,
              type: "integer"
            },
            vfo: {
              minimum: 0,
              maximum: 1,
              type: "integer"
            }
          },
          required: [
            "frequency",
            "vfo"
          ]
        })
      )
    })
  })
})
