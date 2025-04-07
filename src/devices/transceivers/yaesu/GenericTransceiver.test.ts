import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { DeviceType } from "../../base/DeviceType";
import { DriverType } from "../../../drivers/base/DriverType";
import { TestDriver } from "../../../test/utils/TestDriver";
import { AGCAttack } from "../base/AGCAttack";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { GenericTransceiver } from "./GenericTransceiver";
import { DeviceAgnosticDriverTypes } from "../../../drivers";
import { getTestDevice } from "../../../test/utils/getTestDevice";
import { firstValueFrom, take, toArray } from "rxjs";
import { TransceiverEventType } from "../base/TransceiverEvent";

describe("GenericTransceiver", () => {
  const driver = new TestDriver()
  const genericTransceiver = new (getTestDevice(GenericTransceiver))(driver)
  const textEncoder = new TextEncoder()

  beforeEach(async () => {
    jest.spyOn(driver, "writeString")

    await genericTransceiver.open()
  })

  afterEach(async () => {
    jest.restoreAllMocks()
    await genericTransceiver.close()
  })

  test("device type", () => expect(GenericTransceiver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(GenericTransceiver.deviceVendor).toBe(TransceiverVendor.Yaesu))
  test("supportedDrivers", () => expect(GenericTransceiver.supportedDrivers).toEqual([DriverType.CP210xWebUSBDriver, ...DeviceAgnosticDriverTypes]))

  describe("events", () => {
    test("it enables auto information", () => {
      jest.spyOn(genericTransceiver, "enableAutoInformation")

      genericTransceiver.events.subscribe()

      expect(genericTransceiver.enableAutoInformation).toHaveBeenCalled()
    })

    test("it parses information responses into VFO events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      await driver.writeString("IF001014250390+001000300000;")
      await driver.writeString("OI001007200120+001000300000;")
      
      await expect(result).resolves.toEqual([
        {
          frequency: 14_250_390,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.VFO,
          vfo: VFOType.Current
        },
        {
          frequency: 7_200_120,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.VFO,
          vfo: VFOType.Other
        }
      ])
    })
  })

  describe("enableAutoInformation", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.enableAutoInformation({})

      expect(driver.writeString).toHaveBeenCalledWith("AI1;")
    })
  })

  describe("setVFO", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setVFO({ frequency: 14_250_000, vfo: VFOType.Current })
      expect(driver.writeString).toHaveBeenCalledWith("FA014250000;")

      await genericTransceiver.setVFO({ frequency: 7_250_000, vfo: VFOType.Other })
      expect(driver.writeString).toHaveBeenCalledWith("FB007250000;")
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
      driver.write.mockImplementationOnce(() => driver.subject.next(textEncoder.encode("FB012345;FA014250000;")))
      await expect(genericTransceiver.getVFO({ vfo: VFOType.Current })).resolves.toBe(14_250_000)

      driver.write.mockImplementationOnce(() => driver.subject.next(textEncoder.encode("FA012345;FB007200000;")))
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
      expect(driver.writeString).toHaveBeenCalledWith("GT04;")

      await genericTransceiver.setAGC({ attack: AGCAttack.Fast })
      expect(driver.writeString).toHaveBeenCalledWith("GT01;")

      await genericTransceiver.setAGC({ attack: AGCAttack.Mid })
      expect(driver.writeString).toHaveBeenCalledWith("GT02;")

      await genericTransceiver.setAGC({ attack: AGCAttack.Slow })
      expect(driver.writeString).toHaveBeenCalledWith("GT03;")
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
