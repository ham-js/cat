import { describe, expect, test } from "@jest/globals";
import { Generic } from "./Generic"
import { DeviceType } from "../../base/DeviceType";
import { TransceiverDeviceVendor } from "../base/TransceiverDeviceVendor";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { TestSerialPort } from "../../../test/utils/TestSerialPort"
import { TransceiverVFOType } from "../base/TransceiverVFOType";

describe("Generic", () => {
  const testSerialPort = new TestSerialPort()
  const genericTransceiver = new Generic(testSerialPort, 0x5E, 0xE0)

  test("device type", () => expect(Generic.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(Generic.deviceVendor).toBe(TransceiverDeviceVendor.ICOM))

  describe("setVFO", () => {
    test("throws an error when the frequency or vfo are out of range", () => {
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 29_999, vfo: TransceiverVFOType.Current })).toThrow("Number must be greater than or equal to 30000")
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 56_000_001, vfo: TransceiverVFOType.Current })).toThrow("Number must be less than or equal to 56000000")
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: TransceiverVFOType.A })).toThrow("Invalid enum value")
      expect(() => genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.B })).toThrow("Invalid enum value")
    })

    test("implements the command correctly", async () => {
      await genericTransceiver.sendCommand('setVFO', { frequency: 14_250_300, vfo: TransceiverVFOType.Current })
      expect(testSerialPort.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD]))

      await genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.Other })
      expect(testSerialPort.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD]))
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
                "Current",
                "Other"
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
    test("throws an error when the vfo is out of range", () => {
      expect(() => genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.A })).toThrow("Invalid enum value")
      expect(() => genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.B })).toThrow("Invalid enum value")
    })

    test("implements the command correctly", async () => {
      testSerialPort.write.mockImplementationOnce(() => testSerialPort.subject.next(new Uint8Array([
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other vfo
        0xFE, 0xFE, 0x1F, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // from other device
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other controller
        0xFE, 0xFE, 0x5E, 0xAC, 0x26, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different command
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different subcommand
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD,
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // something else
      ])))
      expect(await genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.Current })).toBe(14_250_300)

      testSerialPort.write.mockImplementationOnce(() => testSerialPort.subject.next(new Uint8Array([
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD, // for other vfo
        0xFE, 0xFE, 0x1F, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // from other device
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other controller
        0xFE, 0xFE, 0x5E, 0xAC, 0x26, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different command
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different subcommand
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD,
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // something else
      ])))
      expect(await genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.Other })).toBe(7_250_000)
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('getVFO')).toEqual(
        expect.objectContaining({
          properties: {
            vfo: {
              enum: [
                "Current",
                "Other"
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
    test("implements the command correctly", () => {
      expect(() => genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Auto })).toThrow("Invalid enum value")
      
      genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Fast })
      expect(testSerialPort.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x01, 0xFD]))

      genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Mid })
      expect(testSerialPort.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x02, 0xFD]))

      genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Slow })
      expect(testSerialPort.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x03, 0xFD]))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAGC')).toEqual(
        expect.objectContaining({
          properties: {
            attack: {
              enum: [
                "Fast",
                "Mid",
                "Slow"
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

  describe("getDataFromCommand", () => {
    test("returns the data correctly", () => {
      expect(genericTransceiver["getCommandData"](new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0x12, 0x23, 0x45, 0x67, 0x89, 0xFD]))).toEqual(new Uint8Array([0x01, 0x12, 0x23, 0x45, 0x67, 0x89]))
      expect(genericTransceiver["getCommandData"](new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x12, 0x23, 0x45, 0x67, 0x89, 0xFD]))).toEqual(new Uint8Array([0x12, 0x23, 0x45, 0x67, 0x89]))
      expect(genericTransceiver["getCommandData"](new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0xFD]))).toEqual(new Uint8Array([]))
    })
  })

  describe("commandMatchesDevice", () => {
    test("determines whether the command is from this device and for this controller", () => {
      expect(genericTransceiver["commandMatchesDevice"](new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0x12, 0x23, 0x45, 0x67, 0x89, 0xFD]))).toBe(true)
      expect(genericTransceiver["commandMatchesDevice"](new Uint8Array([0xFE, 0xFE, 0x5F, 0xE0, 0x25, 0x00, 0x01, 0x12, 0x23, 0x45, 0x67, 0x89, 0xFD]))).toBe(false)
      expect(genericTransceiver["commandMatchesDevice"](new Uint8Array([0xFE, 0xFE, 0x5E, 0xE1, 0x25, 0x00, 0x01, 0x12, 0x23, 0x45, 0x67, 0x89, 0xFD]))).toBe(false)
      expect(genericTransceiver["commandMatchesDevice"](new Uint8Array([0xFE, 0xFE, 0x5F, 0xE1, 0x25, 0x00, 0x01, 0x12, 0x23, 0x45, 0x67, 0x89, 0xFD]))).toBe(false)
    })
  })

  describe("buildCommand", () => {
    test("returns the command correctly", () => {
      expect(genericTransceiver["buildCommand"](0x25, 0x00, new Uint8Array([0x01, 0x12, 0x34, 0x56, 0x78, 0x9F]))).toEqual(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0x12, 0x34, 0x56, 0x78, 0x9F, 0xFD]))
      expect(genericTransceiver["buildCommand"](0x12, 0x16)).toEqual(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x12, 0x16, 0xFD]))
    })
  })
})
