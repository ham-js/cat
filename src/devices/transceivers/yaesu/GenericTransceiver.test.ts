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
import { AntennaTunerState } from "../base/AntennaTunerState";

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
    test("it disables auto information upon unsubscribe", () => {
      jest.spyOn(genericTransceiver, "setAutoInformation")

      const subscription = genericTransceiver.events.subscribe()
      const otherSubscription = genericTransceiver.events.subscribe()

      subscription.unsubscribe()
      expect(genericTransceiver.setAutoInformation).not.toHaveBeenCalledWith({ enabled: false })

      otherSubscription.unsubscribe()
      expect(genericTransceiver.setAutoInformation).toHaveBeenCalledWith({ enabled: false })
    })

    test("it enables auto information upon subscribe", () => {
      jest.spyOn(genericTransceiver, "setAutoInformation")

      genericTransceiver.events.subscribe()
      genericTransceiver.events.subscribe()

      expect(genericTransceiver.setAutoInformation).toHaveBeenCalledTimes(1)
      expect(genericTransceiver.setAutoInformation).toHaveBeenCalledWith({ enabled: true })
    })

    test("it parses information responses into VFO events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      await driver.send("IF001014250390+001000300000;")
      await driver.send("OI001007200120+001000300000;")
      
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

    test("it parses antenna tuner responses into AntennaTuner events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(3),
          toArray()
        )
      )

      await driver.send("AC000;")
      await driver.send("AC001;")
      await driver.send("AC002;")
      
      await expect(result).resolves.toEqual([
        {
          state: AntennaTunerState.Off,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AntennaTuner,
        },
        {
          state: AntennaTunerState.On,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AntennaTuner,
        },
        {
          state: AntennaTunerState.StartTuning,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AntennaTuner,
        },
      ])
    })

    test("it parses af gain responses into AFGain events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(4),
          toArray()
        )
      )

      await driver.send("AG0255;")
      await driver.send("AG0128;")
      await driver.send("AG0051;")
      await driver.send("AG0000;")
      
      await expect(result).resolves.toEqual([
        {
          gain: 1,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AFGain,
        },
        {
          gain: 128/255,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AFGain,
        },
        {
          gain: 0.2,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AFGain,
        },
        {
          gain: 0,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AFGain,
        },
      ])
    })
  })

  describe("matchVFOs", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.matchVFOs()

      expect(driver.writeString).toHaveBeenCalledWith("AB;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('matchVFOs')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("getAFGain", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG0;"))

        driver.subject.next(textEncoder.encode("AG0000;"))
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(0)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG0;"))

        driver.subject.next(textEncoder.encode("AG0255;"))
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(1)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG0;"))

        driver.subject.next(textEncoder.encode("AG0051;"))
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(0.2)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAFGain')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("setAFGain", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAFGain({ gain: 0 })
      expect(driver.writeString).toHaveBeenCalledWith("AG0000;")

      await genericTransceiver.setAFGain({ gain: 1 })
      expect(driver.writeString).toHaveBeenCalledWith("AG0255;")

      await genericTransceiver.setAFGain({ gain: 0.5 })
      expect(driver.writeString).toHaveBeenCalledWith("AG0128;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAFGain')).toEqual(expect.objectContaining({
        properties: {
          gain: {
            minimum: 0,
            maximum: 1,
            type: "number"
          }
        }
      }))
    })
  })

  describe("getAntennaTuner", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.subject.next(textEncoder.encode("AC000;"))
      })
      await expect(genericTransceiver.getAntennaTuner()).resolves.toEqual(AntennaTunerState.Off)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.subject.next(textEncoder.encode("AC001;"))
      })
      await expect(genericTransceiver.getAntennaTuner()).resolves.toEqual(AntennaTunerState.On)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.subject.next(textEncoder.encode("AC002;"))
      })
      await expect(genericTransceiver.getAntennaTuner()).resolves.toEqual(AntennaTunerState.StartTuning)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAntennaTuner')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("setAntennaTuner", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAntennaTuner({ state: AntennaTunerState.On })
      expect(driver.writeString).toHaveBeenCalledWith("AC001;")

      await genericTransceiver.setAntennaTuner({ state: AntennaTunerState.Off })
      expect(driver.writeString).toHaveBeenCalledWith("AC000;")

      await genericTransceiver.setAntennaTuner({ state: AntennaTunerState.StartTuning })
      expect(driver.writeString).toHaveBeenCalledWith("AC002;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAntennaTuner')).toEqual(expect.objectContaining({
        properties: {
          state: {
            enum: [
              "On",
              "Off",
              "StartTuning"
            ],
            type: "string"
          }
        }
      }))
    })
  })

  describe("setAutoInformation", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAutoInformation({ enabled: true })
      expect(driver.writeString).toHaveBeenCalledWith("AI1;")

      await genericTransceiver.setAutoInformation({ enabled: false })
      expect(driver.writeString).toHaveBeenCalledWith("AI0;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAutoInformation')).toEqual(expect.objectContaining({
        properties: {
          enabled: {
            type: "boolean"
          }
        }
      }))
    })
  })

  describe("setVFO", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setVFO({ frequency: 14_250_000, vfo: VFOType.Current })
      expect(driver.writeString).toHaveBeenCalledWith("FA014250000;")

      await genericTransceiver.setVFO({ frequency: 7_250_000, vfo: VFOType.Other })
      expect(driver.writeString).toHaveBeenCalledWith("FB007250000;")
    })

    test("specifies the schema correctly", () => {
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
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("FA;"))

        driver.subject.next(textEncoder.encode("FB012345;FA014250000;"))
      })
      await expect(genericTransceiver.getVFO({ vfo: VFOType.Current })).resolves.toBe(14_250_000)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("FB;"))

        driver.subject.next(textEncoder.encode("FA012345;FB007200000;"))
      })
      await expect(genericTransceiver.getVFO({ vfo: VFOType.Other })).resolves.toBe(7_200_000)
    })

    test("specifies the schema correctly", () => {
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

    test("specifies the schema correctly", () => {
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

  describe("readResponse", () => {
    test("it sends a command and reads back the response", async () => {
      const result = genericTransceiver["readResponse"]("TEST", (response) => response.length > 3 ? response.charAt(2) : null)

      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("TEST"))
      driver.send("AB;") // this returns null in the map fn
      driver.send("CDE;")

      await expect(result).resolves.toEqual("E")
    })

    test("it implements a timeout", async () => {
      jest.useFakeTimers()

      const result = genericTransceiver["readResponse"]("TEST", (response) => response.length > 3 ? response.charAt(2) : null)

      // this is a trick to prevent the promise to reject before jest's expect can handle the error because we advance the timer for the timeout
      try {
        return expect(result).rejects.toThrow("Timeout has occurred")
      } finally {
        await jest.advanceTimersToNextTimerAsync()
      }
    })
  })

  describe("parseInformationResponse", () => {
    test("it returns the information response", () => {
      expect(genericTransceiver["parseInformationResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseInformationResponse"]("IF001014250390+001000300000;")).toEqual({
        clarifier: 10,
        ctcssDec: false,
        ctcssEnc: false,
        duplex: false,
        frequency: 14250390,
        memoryChannel: 1,
        mode: "3",
        p7: "0",
        rxClarifierEnabled: false,
        txClarifierEnabled: false
      })
      expect(genericTransceiver["parseInformationResponse"]("IF001014250390+001000300000;", "opposite")).toEqual(null)
      expect(genericTransceiver["parseInformationResponse"]("OI001007200120+001000300000;", "opposite")).toEqual({
        clarifier: 10,
        ctcssDec: false,
        ctcssEnc: false,
        duplex: false,
        frequency: 7200120,
        memoryChannel: 1,
        mode: "3",
        p7: "0",
        rxClarifierEnabled: false,
        txClarifierEnabled: false
      })
    })
  })

  describe("parseAntennaTunerResponse", () => {
    test("it returns the antenna tuner state", () => {
      expect(genericTransceiver["parseAntennaTunerResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseAntennaTunerResponse"]("AC000;")).toEqual(AntennaTunerState.Off)
      expect(genericTransceiver["parseAntennaTunerResponse"]("AC001;")).toEqual(AntennaTunerState.On)
      expect(genericTransceiver["parseAntennaTunerResponse"]("AC002;")).toEqual(AntennaTunerState.StartTuning)
    })
  })

  describe("parseAFGainResponse", () => {
    test("it returns the AF gain", () => {
      expect(genericTransceiver["parseAFGainResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseAFGainResponse"]("AG0000;")).toEqual(0)
      expect(genericTransceiver["parseAFGainResponse"]("AG0255;")).toEqual(1)
      expect(genericTransceiver["parseAFGainResponse"]("AG0128;")).toEqual(128/255)
      expect(genericTransceiver["parseAFGainResponse"]("AG0051;")).toEqual(0.2)
    })
  })
})
