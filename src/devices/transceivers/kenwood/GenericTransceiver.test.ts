import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { GenericTransceiver } from "./GenericTransceiver";
import { TestDriver } from "../../../test/utils/TestDriver";
import { DeviceType } from "../../base/DeviceType";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { AGCAttack } from "../base/AGCAttack";
import { DeviceAgnosticDriverTypes } from "../../../drivers";
import { getTestDevice } from "../../../test/utils/getTestDevice";

describe("GenericTransceiver", () => {
  const textEncoder = new TextEncoder()
  const driver = new TestDriver()
  const genericTransceiver = new (getTestDevice(GenericTransceiver))(driver)

  beforeEach(async () => {
    driver.write.mockReset()
    await genericTransceiver.open()
  })

  afterEach(async () => {
    await genericTransceiver.close()
  })

  test("device type", () => expect(GenericTransceiver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(GenericTransceiver.deviceVendor).toBe(TransceiverVendor.Kenwood))
  test("supportedDrivers", () => expect(GenericTransceiver.supportedDrivers).toEqual([...DeviceAgnosticDriverTypes]))

  describe("setVFOFrequency", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setVFOFrequency({ frequency: 14_250_000, vfo: VFOType.Current })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("FA00014250000;"))

      await genericTransceiver.setVFOFrequency({ frequency: 7_250_000, vfo: VFOType.Other })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("FB00007250000;"))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setVFOFrequency')).toEqual(
        expect.objectContaining({
          properties: {
            frequency: {
              minimum: 30_000,
              maximum: 74_800_000,
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
      driver.write.mockImplementationOnce(() => driver.send(`FB00012345;FA00014250000;`))
      await expect(genericTransceiver.getVFOFrequency({ vfo: VFOType.Current })).resolves.toBe(14_250_000)

      driver.write.mockImplementationOnce(() => driver.send(`FA00012345;FB00007200000;`))
      await expect( genericTransceiver.getVFOFrequency({ vfo: VFOType.Other })).resolves.toBe(7_200_000)
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

  describe("copyBandSettings", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.copyBandSettings({ source: VFOType.Current, target: VFOType.Other })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("VV;"))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('copyBandSettings')).toEqual(
        expect.objectContaining({
          properties: {
            source: {
              enum: [
                "Current",
              ],
              type: "string"
            },
            target: {
              enum: [
                "Other",
              ],
              type: "string"
            }
          },
          required: [
            "source",
            "target"
          ]
        })
      )
    })
  })

  describe("setAGCAttack", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Off })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC00;"))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Fast })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC03;"))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Mid })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC02;"))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Slow })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC01;"))

      await genericTransceiver.setAGCAttack({ attack: "on" })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC04;"))
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAGCAttack')).toEqual(
        expect.objectContaining({
          properties: {
            attack: {
              enum: [
                "Off",
                "Slow",
                "Mid",
                "Fast",
                "on"
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
