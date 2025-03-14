import { describe, expect, test } from "@jest/globals";
import { FT891 } from "./FT891";
import { DeviceType } from "../../base/enums/DeviceType";
import { TransceiverDeviceVendor } from "../base/types/TransceiverDeviceVendor";
import { TransceiverAGCAttack } from "../base/types/TransceiverAGCAttack";

describe("FT891", () => {
  const ft891 = new FT891()
  ft891.buildCommand('setVFO', {vfo: 0, frequency: 30000})

  test("device name", () => expect(FT891.deviceName).toBe("FT-891"))
  test("device type", () => expect(FT891.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(FT891.deviceVendor).toBe(TransceiverDeviceVendor.Yaesu))

  describe("setVFO", () => {
    test("throws an error when the frequency or vfo are out of range", () => {
      expect(() => ft891.buildCommand('setVFO', { frequency: 29_999, vfo: 0 })).toThrowError("Number must be greater than or equal to 30000")
      expect(() => ft891.buildCommand('setVFO', { frequency: 56_000_001, vfo: 0 })).toThrowError("Number must be less than or equal to 56000000")
      expect(() => ft891.buildCommand('setVFO', { frequency: 14_250_000, vfo: 2 })).toThrowError("Number must be less than or equal to 1")
      expect(() => ft891.buildCommand('setVFO', { frequency: 7_250_000, vfo: -1 })).toThrowError("Number must be greater than or equal to 0")
    })

    test("implements the command factory correctly", () => {
      expect(ft891.buildCommand('setVFO', { frequency: 14_250_000, vfo: 0 })).toBe("FA014250000;")
      expect(ft891.buildCommand('setVFO', { frequency: 7_250_000, vfo: 1 })).toBe("FB007250000;")
    })

    test("specifies the parameter type correctly", () => {
      expect(ft891.getCommandFactorySchema('setVFO')).toEqual(
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
    test("throws an error when the vfo is out of range", () => {
      expect(() => ft891.buildCommand('getVFO', { vfo: -1 })).toThrowError("Number must be greater than or equal to 0")
      expect(() => ft891.buildCommand('getVFO', { vfo: 2 })).toThrowError("Number must be less than or equal to 1")
    })
    test("implements the command factory correctly", () => {

      expect(ft891.buildCommand('getVFO', { vfo: 0 })).toBe("FA;")
      expect(ft891.buildCommand('getVFO', { vfo: 1 })).toBe("FB;")
    })

    test("specifies the parameter type correctly", () => {
      expect(ft891.getCommandFactorySchema('getVFO')).toEqual(
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
      expect(ft891.buildCommand('setAGC', { attack: TransceiverAGCAttack.Auto })).toBe("GT04;")
      expect(ft891.buildCommand('setAGC', { attack: TransceiverAGCAttack.Fast })).toBe("GT01;")
      expect(ft891.buildCommand('setAGC', { attack: TransceiverAGCAttack.Mid })).toBe("GT02;")
      expect(ft891.buildCommand('setAGC', { attack: TransceiverAGCAttack.Slow })).toBe("GT03;")
    })

    test("specifies the parameter type correctly", () => {
      expect(ft891.getCommandFactorySchema('setAGC')).toEqual(
        expect.objectContaining({
          properties: {
            attack: {
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
            "attack"
          ]
        })
      )
    })
  })
})
