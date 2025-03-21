import { beforeEach, describe, expect, test } from "@jest/globals";
import { DeviceType } from "../../base/DeviceType";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { GenericDriver } from "./GenericDriver"
import { TestCommunicationDriver } from "../../../test/utils/TestCommunicationDriver"
import { TransceiverVFOType } from "../base/TransceiverVFOType";

describe("GenericDriver", () => {
  const textEncoder = new TextEncoder()
  const testCommunicationDriver = new TestCommunicationDriver()
  const genericTransceiver = new GenericDriver(testCommunicationDriver)

  beforeEach(() => {
    testCommunicationDriver.write.mockReset()
  })

  test("device type", () => expect(GenericDriver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(GenericDriver.deviceVendor).toBe(TransceiverVendor.Yaesu))

  describe("setVFO", () => {
    test("throws an error when the frequency or vfo are out of range", async () => {
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 29_999, vfo: TransceiverVFOType.A })).rejects.toThrow("Number must be greater than or equal to 30000")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 56_000_001, vfo: TransceiverVFOType.A })).rejects.toThrow("Number must be less than or equal to 56000000")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: TransceiverVFOType.Current })).rejects.toThrow("Invalid enum value")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.Other })).rejects.toThrow("Invalid enum value")
    })

    test("implements the command correctly", async () => {
      await genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: TransceiverVFOType.A })
      expect(testCommunicationDriver.write).toHaveBeenCalledWith(textEncoder.encode("FA014250000;"))

      await genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.B })
      expect(testCommunicationDriver.write).toHaveBeenCalledWith(textEncoder.encode("FB007250000;"))
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
              enum: [
                "A",
                "B"
              ],
              type: "string"
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
    test("throws an error when the vfo is out of range", async () => {
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.Current })).rejects.toThrow("Invalid enum value")
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.Other })).rejects.toThrow("Invalid enum value")
    })

    test("implements the command correctly", async () => {
      testCommunicationDriver.write.mockImplementationOnce(() => testCommunicationDriver.subject.next(textEncoder.encode(`FB012345;FA014250000;`)))
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.A })).resolves.toBe(14_250_000)

      testCommunicationDriver.write.mockImplementationOnce(() => testCommunicationDriver.subject.next(textEncoder.encode(`FA012345;FB007200000;`)))
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.B })).resolves.toBe(7_200_000)
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('getVFO')).toEqual(
        expect.objectContaining({
          properties: {
            vfo: {
              enum: [
                "A",
                "B"
              ],
              type: "string"
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
    test("implements the command factory correctly", async () => {
      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Auto })
      expect(testCommunicationDriver.write).toHaveBeenCalledWith(textEncoder.encode("GT04;"))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Fast })
      expect(testCommunicationDriver.write).toHaveBeenCalledWith(textEncoder.encode("GT01;"))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Mid })
      expect(testCommunicationDriver.write).toHaveBeenCalledWith(textEncoder.encode("GT02;"))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Slow })
      expect(testCommunicationDriver.write).toHaveBeenCalledWith(textEncoder.encode("GT03;"))
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
