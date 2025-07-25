import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";

import { GenericTransceiver } from "./GenericTransceiver";
import { TestDriver } from "../../../test/utils/TestDriver";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { DeviceType } from "../../base/DeviceType";
import { VFOType } from "../base/VFOType";
import { AGCAttack } from "../base/AGCAttack";
import { DeviceAgnosticDriverTypes } from "../../../drivers";
import { getTestDevice } from "../../../test/utils/getTestDevice";

describe("GenericTransceiver", () => {
  const driver = new TestDriver()
  const genericTransceiver = new (getTestDevice(GenericTransceiver))(driver, { deviceAddress: 0x5E, controllerAddress: 0xE0 })

  beforeEach(async () => {
    await genericTransceiver.open()
  })

  afterEach(async () => {
    await genericTransceiver.close()
  })

  test("device type", () => expect(GenericTransceiver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(GenericTransceiver.deviceVendor).toBe(TransceiverVendor.ICOM))
  test("supportedDrivers", () => expect(GenericTransceiver.supportedDrivers).toEqual([...DeviceAgnosticDriverTypes]))

  describe("setVFOFrequency", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setVFOFrequency({ frequency: 14_250_300, vfo: VFOType.Current })
      expect(driver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD]))

      await genericTransceiver.setVFOFrequency({ frequency: 7_250_000, vfo: VFOType.Other })
      expect(driver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD]))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setVFOFrequency')).toEqual(
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

  describe("getVFOFrequency", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(
          new Uint8Array([
            0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0xFD
          ])
        )

        driver.send(new Uint8Array([
          0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other vfo
          0xFE, 0xFE, 0x1F, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // from other device
          0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other controller
          0xFE, 0xFE, 0x5E, 0xAC, 0x26, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different command
          0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different subcommand
          0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD,
          0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // something else
        ]))
      })
      await expect(genericTransceiver.getVFOFrequency({ vfo: VFOType.Current })).resolves.toBe(14_250_300)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(
          new Uint8Array([
            0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0xFD
          ])
        )

        driver.send(new Uint8Array([
          0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x00, 0b0000_0000, 0b0000_0011, 0b0010_0101, 0b0001_0100, 0b0000_0000, 0xFD, // for other vfo
          0xFE, 0xFE, 0x1F, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // from other device
          0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // for other controller
          0xFE, 0xFE, 0x5E, 0xAC, 0x26, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different command
          0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // different subcommand
          0xFE, 0xFE, 0x5E, 0xE0, 0x25, 0x00, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD,
          0xFE, 0xFE, 0x5E, 0xAC, 0x25, 0x01, 0x01, 0b0000_0000, 0b0000_0000, 0b0010_0101, 0b0000_0111, 0b0000_0000, 0xFD, // something else
        ]))
      })
      await expect(genericTransceiver.getVFOFrequency({ vfo: VFOType.Other })).resolves.toBe(7_250_000)
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('getVFOFrequency')).toEqual(
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

  describe("setAGCAttack", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Fast })
      expect(driver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x01, 0xFD]))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Mid })
      expect(driver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x02, 0xFD]))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Slow })
      expect(driver.write).toHaveBeenCalledWith(new Uint8Array([0xFE, 0xFE, 0x5E, 0xE0, 0x16, 0x12, 0x03, 0xFD]))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAGCAttack')).toEqual(
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
