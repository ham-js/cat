import { describe, expect, test } from "@jest/globals";
import { FT891, FT891AGCLevel } from "./FT891";
import { DeviceType } from "../../base/enums/DeviceType";
import { TransceiverDeviceVendor } from "../base/types/TransceiverDeviceVendor";

describe("FT891", () => {
  const ft891 = new FT891()

  test("device name", () => expect(FT891.deviceName).toBe("FT-891"))
  test("device type", () => expect(FT891.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(FT891.deviceVendor).toBe(TransceiverDeviceVendor.Yaesu))

  describe("setVFO", () => {
    test("implements the command factory correctly", () => {
      expect(ft891.buildCommand('setVFO', { frequency: 14_250_000, vfo: 0 })).toBe("FA014250000;")
      expect(ft891.buildCommand('setVFO', { frequency: 7_250_000, vfo: 1 })).toBe("FB007250000;")
    })

    test("specifies the parameter type correctly", () => {
      expect(ft891.getCommandSchema('setVFO')).toEqual(
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

  describe("getVFO", () => {
    test("implements the command factory correctly", () => {
      expect(ft891.buildCommand('getVFO', { vfo: 0 })).toBe("FA;")
      expect(ft891.buildCommand('getVFO', { vfo: 1 })).toBe("FB;")
    })

    test("specifies the parameter type correctly", () => {
      expect(ft891.getCommandSchema('getVFO')).toEqual(
        expect.objectContaining({
          properties: {
            vfo: {
              minimum: 0,
              maximum: 1,
              type: "integer"
            }
          },
          required: [
            "vfo"
          ]
        })
      )
    })
  })

  describe("setAGC", () => {
    test("implements the command factory correctly", () => {
      expect(ft891.buildCommand('setAGC', { level: FT891AGCLevel.Auto })).toBe("GT04;")
      expect(ft891.buildCommand('setAGC', { level: FT891AGCLevel.Fast })).toBe("GT01;")
      expect(ft891.buildCommand('setAGC', { level: FT891AGCLevel.Mid })).toBe("GT02;")
      expect(ft891.buildCommand('setAGC', { level: FT891AGCLevel.Slow })).toBe("GT03;")
    })

    test("specifies the parameter type correctly", () => {
      expect(ft891.getCommandSchema('setAGC')).toEqual(
        expect.objectContaining({
          properties: {
            level: {
              enum: [
                "Off",
                "Slow",
                "Mid",
                "Fast",
                "Auto"
              ],
              type: "string"
            }
          },
          required: [
            "level"
          ]
        })
      )
    })
  })
})
