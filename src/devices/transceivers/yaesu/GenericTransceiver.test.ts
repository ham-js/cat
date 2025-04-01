import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { DeviceType } from "../../base/DeviceType";
import { DriverType } from "../../../drivers/base/DriverType";
import { TestDriver } from "../../../test/utils/TestDriver";
import { AGCAttack } from "../base/AGCAttack";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { GenericTransceiver } from "./GenericTransceiver";
import { DeviceAgnosticDriverTypes } from "../../../drivers";
import { getTestDevice } from "../../../test/utils/getTestDevice";

describe("GenericTransceiver", () => {
  const textEncoder = new TextEncoder()
  const driver = new TestDriver()
  const genericTransceiver = new (getTestDevice(GenericTransceiver))(driver)

  beforeEach(async () => {
    await genericTransceiver.open()
    driver.write.mockReset()
  })

  afterEach(async () => {
    await genericTransceiver.close()
  })

  test("device type", () => expect(GenericTransceiver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(GenericTransceiver.deviceVendor).toBe(TransceiverVendor.Yaesu))
  test("supportedDrivers", () => expect(GenericTransceiver.supportedDrivers).toEqual([DriverType.CP210xWebUSBDriver, ...DeviceAgnosticDriverTypes]))

  describe("setVFO", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setVFO({ frequency: 14_250_000, vfo: VFOType.Current })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("FA014250000;"))

      await genericTransceiver.setVFO({ frequency: 7_250_000, vfo: VFOType.Other })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("FB007250000;"))
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
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce(() => driver.subject.next(textEncoder.encode(`FB012345;FA014250000;`)))
      await expect(genericTransceiver.getVFO({ vfo: VFOType.Current })).resolves.toBe(14_250_000)

      driver.write.mockImplementationOnce(() => driver.subject.next(textEncoder.encode(`FA012345;FB007200000;`)))
      await expect(genericTransceiver.getVFO({ vfo: VFOType.Other })).resolves.toBe(7_200_000)
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
    test("implements the command factory correctly", async () => {
      await genericTransceiver.setAGC({ attack: AGCAttack.Auto })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GT04;"))

      await genericTransceiver.setAGC({ attack: AGCAttack.Fast })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GT01;"))

      await genericTransceiver.setAGC({ attack: AGCAttack.Mid })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GT02;"))

      await genericTransceiver.setAGC({ attack: AGCAttack.Slow })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GT03;"))
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
