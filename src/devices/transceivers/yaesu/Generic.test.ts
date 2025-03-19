import { beforeEach, describe, expect, test } from "@jest/globals";
import { DeviceType } from "../../base/DeviceType";
import { TransceiverDeviceVendor } from "../base/TransceiverDeviceVendor";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { Generic } from "./Generic"
import { TestSerialPort } from "../../../test/utils/TestSerialPort"

describe("YaesuTransceiverDevice", () => {
  const textEncoder = new TextEncoder()
  const testSerialPort = new TestSerialPort()
  const genericTransceiver = new Generic(testSerialPort)

  beforeEach(() => {
    testSerialPort.write.mockReset()
  })

  test("device type", () => expect(Generic.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(Generic.deviceVendor).toBe(TransceiverDeviceVendor.Yaesu))

  describe("setVFO", () => {
    test("throws an error when the frequency or vfo are out of range", () => {
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 29_999, vfo: 0 })).toThrow("Number must be greater than or equal to 30000")
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 56_000_001, vfo: 0 })).toThrow("Number must be less than or equal to 56000000")
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: 2 })).toThrow("Number must be less than or equal to 1")
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: -1 })).toThrow("Number must be greater than or equal to 0")
    })

    test("implements the command correctly", async () => {
      await genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: 0 })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("FA014250000;"))

      await genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: 1 })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("FB007250000;"))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setVFO')).toEqual(
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
      expect(() => genericTransceiver.sendCommand('getVFO', { vfo: -1 })).toThrow("Number must be greater than or equal to 0")
      expect(() => genericTransceiver.sendCommand('getVFO', { vfo: 2 })).toThrow("Number must be less than or equal to 1")
    })

    test("implements the command correctly", async () => {
      testSerialPort.write.mockImplementationOnce(() => testSerialPort.subject.next(textEncoder.encode(`FB012345;FA014250000;`)))
      expect(await genericTransceiver.sendCommand('getVFO', { vfo: 0 })).toBe(14_250_000)

      testSerialPort.write.mockImplementationOnce(() => testSerialPort.subject.next(textEncoder.encode(`FA012345;FB007200000;`)))
      expect(await genericTransceiver.sendCommand('getVFO', { vfo: 1 })).toBe(7_200_000)
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('getVFO')).toEqual(
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
      genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Auto })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GT04;"))

      genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Fast })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GT01;"))

      genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Mid })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GT02;"))

      genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Slow })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GT03;"))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAGC')).toEqual(
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
