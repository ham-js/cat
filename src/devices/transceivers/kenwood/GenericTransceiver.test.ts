import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { GenericTransceiver } from "./GenericTransceiver";
import { TestDriver } from "../../../test/utils/TestDriver";
import { DeviceType } from "../../base/DeviceType";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { AGCAttack } from "../base/AGCAttack";
import { PlatformAgnosticDriverTypes } from "../../../drivers";
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
  test("supportedDrivers", () => expect(GenericTransceiver.supportedDrivers).toEqual([...PlatformAgnosticDriverTypes]))

  describe("setVFO", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setVFO({ frequency: 14_250_000, vfo: VFOType.A })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("FA00014250000;"))

      await genericTransceiver.setVFO({ frequency: 7_250_000, vfo: VFOType.B })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("FB00007250000;"))
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
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce(() => driver.subject.next(textEncoder.encode(`FB00012345;FA00014250000;`)))
      await expect(genericTransceiver.getVFO({ vfo: VFOType.A })).resolves.toBe(14_250_000)

      driver.write.mockImplementationOnce(() => driver.subject.next(textEncoder.encode(`FA00012345;FB00007200000;`)))
      await expect( genericTransceiver.getVFO({ vfo: VFOType.B })).resolves.toBe(7_200_000)
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
      await genericTransceiver.setAGC({ attack: AGCAttack.Off })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC00;"))

      await genericTransceiver.setAGC({ attack: AGCAttack.Fast })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC03;"))

      await genericTransceiver.setAGC({ attack: AGCAttack.Mid })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC02;"))

      await genericTransceiver.setAGC({ attack: AGCAttack.Slow })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC01;"))
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
