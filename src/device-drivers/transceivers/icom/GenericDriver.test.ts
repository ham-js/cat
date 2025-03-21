import { describe, expect, test } from "@jest/globals";
import { GenericDriver } from "./GenericDriver"
import { DeviceType } from "../../base/DeviceType";
import { TestCommunicationDriver } from "../../../test/utils/TestCommunicationDriver"
import { TransceiverVendor } from "../base/TransceiverVendor";
import { TransceiverAGCAttack } from "../base/TransceiverAGCAttack";
import { TransceiverVFOType } from "../base/TransceiverVFOType";

describe("GenericDriver", () => {
  const communicationDriver = new TestCommunicationDriver()
  const genericTransceiver = new GenericDriver(communicationDriver, 0x5E, 0xE0)

  test("device type", () => expect(GenericDriver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(GenericDriver.deviceVendor).toBe(TransceiverVendor.ICOM))

  describe("setVFO", () => {
    test("throws an error when the frequency or vfo are out of range", async () => {
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 29_999, vfo: TransceiverVFOType.Current })).rejects.toThrow("Number must be greater than or equal to 30000")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 56_000_001, vfo: TransceiverVFOType.Current })).rejects.toThrow("Number must be less than or equal to 56000000")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 14_250_000, vfo: TransceiverVFOType.A })).rejects.toThrow("Invalid enum value")
      await expect(genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.B })).rejects.toThrow("Invalid enum value")
    })

    test("implements the command correctly", async () => {
      await genericTransceiver.sendCommand('setVFO', { frequency: 14_250_300, vfo: TransceiverVFOType.Current })
      expect(communicationDriver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD]))

      await genericTransceiver.sendCommand('setVFO', { frequency: 7_250_000, vfo: TransceiverVFOType.Other })
      expect(communicationDriver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD]))
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
    test("throws an error when the vfo is out of range", async () => {
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.A })).rejects.toThrow("Invalid enum value")
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.B })).rejects.toThrow("Invalid enum value")
    })

    test("implements the command correctly", async () => {
      communicationDriver.write.mockImplementationOnce(() => communicationDriver.subject.next(new Uint8Array([
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other vfo
        0xFE, 0xFE, 0x1F, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // from other device
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other controller
        0xFE, 0xFE, 0x5E, 0xAC, 0x26, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different command
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different subcommand
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD,
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // something else
      ])))
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.Current })).resolves.toBe(14_250_300)

      communicationDriver.write.mockImplementationOnce(() => communicationDriver.subject.next(new Uint8Array([
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD, // for other vfo
        0xFE, 0xFE, 0x1F, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // from other device
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other controller
        0xFE, 0xFE, 0x5E, 0xAC, 0x26, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different command
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different subcommand
        0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD,
        0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // something else
      ])))
      await expect(genericTransceiver.sendCommand('getVFO', { vfo: TransceiverVFOType.Other })).resolves.toBe(7_250_000)
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
    test("throws an error when the attack is not supported", async () => {
      await expect(genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Auto })).rejects.toThrow("Invalid enum value")
      await expect(genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Off })).rejects.toThrow("Invalid enum value")
    })
    
    test("implements the command correctly", async () => {
      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Fast })
      expect(communicationDriver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x01, 0xFD]))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Mid })
      expect(communicationDriver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x02, 0xFD]))

      await genericTransceiver.sendCommand('setAGC', { attack: TransceiverAGCAttack.Slow })
      expect(communicationDriver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x03, 0xFD]))
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
