import { describe, expect, test } from "@jest/globals";
import { DeviceType } from "../../base/enums/DeviceType";
import { TransceiverDeviceVendor } from "../base/enums/TransceiverDeviceVendor";
import { TransceiverAGCAttack } from "../base/enums/TransceiverAGCAttack";
import { Generic } from "./Generic"

describe("Generic", () => {
  const genericTransceiver = new Generic(0x5E, 0xE0)

  test("device type", () => expect(Generic.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(Generic.deviceVendor).toBe(TransceiverDeviceVendor.ICOM))

  describe("setVFO", () => {
    test("throws an error when the frequency or vfo are out of range", () => {
      expect(() => genericTransceiver.buildCommand('setVFO', { frequency: 29_999, vfo: 0 })).toThrowError("Number must be greater than or equal to 30000")
      expect(() => genericTransceiver.buildCommand('setVFO', { frequency: 56_000_001, vfo: 0 })).toThrowError("Number must be less than or equal to 56000000")
      expect(() => genericTransceiver.buildCommand('setVFO', { frequency: 14_250_000, vfo: 2 })).toThrowError("Number must be less than or equal to 1")
      expect(() => genericTransceiver.buildCommand('setVFO', { frequency: 7_250_000, vfo: -1 })).toThrowError("Number must be greater than or equal to 0")
    })

    test("implements the command factory correctly", () => {
      expect(genericTransceiver.buildCommand('setVFO', { frequency: 14_250_000, vfo: 0 })).toBe([0xFE, 0xFE, 0x5E, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFD])
      expect(genericTransceiver.buildCommand('setVFO', { frequency: 7_250_000, vfo: 1 })).toBe("FB007250000;")
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandFactorySchema('setVFO')).toEqual(
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
      expect(() => genericTransceiver.buildCommand('getVFO', { vfo: -1 })).toThrowError("Number must be greater than or equal to 0")
      expect(() => genericTransceiver.buildCommand('getVFO', { vfo: 2 })).toThrowError("Number must be less than or equal to 1")
    })

    test("implements the command factory correctly", () => {
      expect(genericTransceiver.buildCommand('getVFO', { vfo: 0 })).toEqual(new Uint16Array([0xFE, 0xFE, 0x5E, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFD]))
      expect(genericTransceiver.buildCommand('getVFO', { vfo: 1 })).toEqual(new Uint16Array([0xFE, 0xFE, 0x5E, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFD]))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandFactorySchema('getVFO')).toEqual(
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
      expect(genericTransceiver.buildCommand('setAGC', { attack: TransceiverAGCAttack.Auto })).toBe("GT04;")
      expect(genericTransceiver.buildCommand('setAGC', { attack: TransceiverAGCAttack.Fast })).toBe("GT01;")
      expect(genericTransceiver.buildCommand('setAGC', { attack: TransceiverAGCAttack.Mid })).toBe("GT02;")
      expect(genericTransceiver.buildCommand('setAGC', { attack: TransceiverAGCAttack.Slow })).toBe("GT03;")
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandFactorySchema('setAGC')).toEqual(
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
