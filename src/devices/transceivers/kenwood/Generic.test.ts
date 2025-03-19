import { beforeEach, describe, expect, test } from "@jest/globals";
import { DeviceType } from "../../base/DeviceType";
import { TransceiverDeviceVendor } from "../base/TransceiverDeviceVendor";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { Generic } from "./Generic"
import { TestSerialPort } from "../../../test/utils/TestSerialPort"
import { TransceiverVFOType } from "../base/TransceiverVFOType";

describe("Generic", () => {
  const textEncoder = new TextEncoder()
  const testSerialPort = new TestSerialPort()
  const genericTransceiver = new Generic(testSerialPort)

  beforeEach(() => {
    testSerialPort.write.mockReset()
  })

  test("device type", () => expect(Generic.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(Generic.deviceVendor).toBe(TransceiverDeviceVendor.Kenwood))

  describe("setVFO", () => {
    test("throws an error when the frequency or vfo are out of range", async () => {
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 29_999, vfo: TransceiverVFOType.A })).rejects.toThrow("Number must be greater than or equal to 30000")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 74_800_001, vfo: TransceiverVFOType.A })).rejects.toThrow("Number must be less than or equal to 74800000")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: TransceiverVFOType.Current })).rejects.toThrow("Invalid enum value")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.Other })).rejects.toThrow("Invalid enum value")
    })

    test("implements the command correctly", async () => {
      await genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: TransceiverVFOType.A })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("FA00014250000;"))

      await genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.B })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("FB00007250000;"))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setVFO')).toEqual(
        expect.objectContaining({
          properties: {
            frequency: {
              minimum: 30_000,
              maximum: 74_800_000,
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
      testSerialPort.write.mockImplementationOnce(() => testSerialPort.subject.next(textEncoder.encode(`FB00012345;FA00014250000;`)))
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.A })).resolves.toBe(14_250_000)

      testSerialPort.write.mockImplementationOnce(() => testSerialPort.subject.next(textEncoder.encode(`FA00012345;FB00007200000;`)))
      await expect( genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.B })).resolves.toBe(7_200_000)
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
    test("throws an error when the attack is not supported", async () => {
      await expect(genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Auto })).rejects.toThrow("Invalid enum value")
    })

    test("implements the command factory correctly", async () => {
      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Off })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GC00;"))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Fast })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GC03;"))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Mid })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GC02;"))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Slow })
      expect(testSerialPort.write).toHaveBeenCalledWith(textEncoder.encode("GC01;"))
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
