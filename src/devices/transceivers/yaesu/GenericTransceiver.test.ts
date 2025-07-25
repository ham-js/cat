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
import { Direction } from "../base/Direction";
import { CTCSSFrequencies } from "../base/CTCSSFrequencies";
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

    test("it parses agc responses into AGCAuto and AGCAttack events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(11),
          toArray()
        )
      )

      driver.send("GT00;")
      driver.send("GT04;")
      driver.send("GT01;")
      driver.send("GT05;")
      driver.send("GT02;")
      driver.send("GT06;")
      driver.send("GT03;")

      await expect(result).resolves.toEqual([
        {
          attack: AGCAttack.Off,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAttack,
        },
        {
          auto: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAuto,
        },
        {
          attack: AGCAttack.Fast,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAttack,
        },
        {
          auto: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAuto,
        },
        {
          auto: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAuto,
        },
        {
          attack: AGCAttack.Mid,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAttack,
        },
        {
          auto: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAuto,
        },
        {
          auto: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAuto,
        },
        {
          attack: AGCAttack.Slow,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAttack,
        },
        {
          auto: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAuto,
        },
        {
          auto: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AGCAuto,
        },
      ])
    })

    test("it parses ctcss frequency responses into CTCSSFrequency events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(3),
          toArray()
        )
      )

      driver.send("CN00000;")
      driver.send("CN00002;")
      driver.send("CN00049;")

      await expect(result).resolves.toEqual([
        {
          frequency: 67,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.CTCSSFrequency,
        },
        {
          frequency: 71.9,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.CTCSSFrequency,
        },
        {
          frequency: 254.1,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.CTCSSFrequency,
        },
      ])
    })

    test("it parses rit enabled responses into RITEnabled events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      driver.send("CF000;")
      driver.send("CF010;")

      await expect(result).resolves.toEqual([
        {
          enabled: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.RITEnabled,
        },
        {
          enabled: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.RITEnabled,
        },
      ])
    })

    test("it parses tx busy responses into RXBusy events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      driver.send("BY00;")
      driver.send("BY10;")

      await expect(result).resolves.toEqual([
        {
          busy: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.TXBusy,
        },
        {
          busy: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.TXBusy,
        },
      ])
    })

    test("it parses manual notch frequency responses into ManualNotchFrequencyOffset events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(3),
          toArray()
        )
      )

      driver.send("BP01001;")
      driver.send("BP01045;")
      driver.send("BP01320;")

      await expect(result).resolves.toEqual([
        {
          frequencyOffset: 10 / 3200,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.ManualNotchFrequencyOffset,
        },
        {
          frequencyOffset: 450 / 3200,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.ManualNotchFrequencyOffset,
        },
        {
          frequencyOffset: 1,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.ManualNotchFrequencyOffset,
        }
      ])
    })

    test("it parses manual notch enabled responses into ManualNotchEnabled events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      driver.send("BP00000;")
      driver.send("BP00001;")

      await expect(result).resolves.toEqual([
        {
          enabled: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.ManualNotchEnabled,
        },
        {
          enabled: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.ManualNotchEnabled,
        }
      ])
    })

    test("it parses auto notch responses into AutoNotch events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      driver.send("BC00;")
      driver.send("BC01;")

      await expect(result).resolves.toEqual([
        {
          enabled: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AutoNotch,
        },
        {
          enabled: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AutoNotch,
        }
      ])
    })

    test("it parses information responses into VFO events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      driver.send("IF001014250390+001000300000;")
      driver.send("OI001007200120+001000300000;")

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

    test("it parses break in responses into BreakIn events", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const result = firstValueFrom(
        genericTransceiver.events.pipe(
          take(2),
          toArray()
        )
      )

      driver.send("BI0;")
      driver.send("BI1;")

      await expect(result).resolves.toEqual([
        {
          enabled: false,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.BreakIn,
        },
        {
          enabled: true,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.BreakIn,
        },
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

      driver.send("AC000;")
      driver.send("AC001;")
      driver.send("AC002;")

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
          state: AntennaTunerState.Tuning,
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

      driver.send("AG0255;")
      driver.send("AG0128;")
      driver.send("AG0051;")
      driver.send("AG0000;")

      await expect(result).resolves.toEqual([
        {
          gain: 1,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.AFGain,
        },
        {
          gain: 128 / 255,
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

  describe("copyBandSettings", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.copyBandSettings({ source: VFOType.Current, target: VFOType.Other })
      expect(driver.writeString).toHaveBeenCalledWith("AB;")

      await genericTransceiver.copyBandSettings({ source: VFOType.Current, target: "memory" })
      expect(driver.writeString).toHaveBeenCalledWith("AM;")

      await genericTransceiver.copyBandSettings({ source: VFOType.Other, target: VFOType.Current })
      expect(driver.writeString).toHaveBeenCalledWith("BA;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('copyBandSettings')).toEqual(expect.objectContaining({
        properties: {
          source: {
            enum: [
              "Current",
              "Other",
              "memory"
            ],
            type: "string"
          },
          target: {
            enum: [
              "Current",
              "Other",
              "memory"
            ],
            type: "string"
          }
        },
        required: [
          "source",
          "target"
        ]
      }))
    })
  })

  describe("getRITEnabled", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CF0;"))

        driver.send("CF000;")
      })
      await expect(genericTransceiver.getRITEnabled()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CF0;"))

        driver.send("CF010;")
      })
      await expect(genericTransceiver.getRITEnabled()).resolves.toEqual(true)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getRITEnabled')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("setRITEnabled", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setRITEnabled({ enabled: false })
      expect(driver.writeString).toHaveBeenCalledWith("CF000;")

      await genericTransceiver.setRITEnabled({ enabled: true })
      expect(driver.writeString).toHaveBeenCalledWith("CF000;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setRITEnabled')).toEqual(expect.objectContaining({
        properties: {
          enabled: {
            type: "boolean"
          }
        },
        required: [
          "enabled"
        ]
      }))
    })
  })

  describe("getAFGain", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG0;"))

        driver.send("AG0000;")
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(0)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG0;"))

        driver.send("AG0255;")
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(1)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG0;"))

        driver.send("AG0051;")
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(0.2)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAFGain')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("setBand", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setBand({ band: "160m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS00;")

      await genericTransceiver.setBand({ band: "80m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS01;")

      await genericTransceiver.setBand({ band: "40m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS03;")

      await genericTransceiver.setBand({ band: "30m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS04;")

      await genericTransceiver.setBand({ band: "20m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS05;")

      await genericTransceiver.setBand({ band: "17m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS06;")

      await genericTransceiver.setBand({ band: "15m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS07;")

      await genericTransceiver.setBand({ band: "13m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS08;")

      await genericTransceiver.setBand({ band: "10m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS09;")

      await genericTransceiver.setBand({ band: "6m" })
      expect(driver.writeString).toHaveBeenCalledWith("BS10;")

      await genericTransceiver.setBand({ band: "General" })
      expect(driver.writeString).toHaveBeenCalledWith("BS10;")

      await genericTransceiver.setBand({ band: "10km" })
      expect(driver.writeString).toHaveBeenCalledWith("BS11;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setBand')).toEqual(expect.objectContaining({
        properties: {
          band: {
            enum: [
              "10km",
              "160m",
              "80m",
              "40m",
              "30m",
              "20m",
              "17m",
              "15m",
              "13m",
              "10m",
              "6m",
              "General",
            ],
            type: "string"
          },
        },
        required: [
          "band"
        ]
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
        },
        required: [
          "gain"
        ]
      }))
    })
  })

  describe("getAntennaTunerState", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC000;")
      })
      await expect(genericTransceiver.getAntennaTunerState()).resolves.toEqual(AntennaTunerState.Off)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC001;")
      })
      await expect(genericTransceiver.getAntennaTunerState()).resolves.toEqual(AntennaTunerState.On)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC002;")
      })
      await expect(genericTransceiver.getAntennaTunerState()).resolves.toEqual(AntennaTunerState.Tuning)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAntennaTunerState')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("setAntennaTunerState", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAntennaTunerState({ state: AntennaTunerState.On })
      expect(driver.writeString).toHaveBeenCalledWith("AC001;")

      await genericTransceiver.setAntennaTunerState({ state: AntennaTunerState.Off })
      expect(driver.writeString).toHaveBeenCalledWith("AC000;")

      await genericTransceiver.setAntennaTunerState({ state: AntennaTunerState.Tuning })
      expect(driver.writeString).toHaveBeenCalledWith("AC002;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAntennaTunerState')).toEqual(expect.objectContaining({
        properties: {
          state: {
            enum: [
              "Off",
              "On",
              "Tuning"
            ],
            type: "string"
          },
        },
        required: [
          "state"
        ]
      }))
    })
  })

  describe("setAutoNotchEnabled", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAutoNotchEnabled({ enabled: false })
      expect(driver.writeString).toHaveBeenCalledWith("BC00;")

      await genericTransceiver.setAutoNotchEnabled({ enabled: true })
      expect(driver.writeString).toHaveBeenCalledWith("BC01;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAutoNotchEnabled')).toEqual(expect.objectContaining({
        properties: {
          enabled: {
            type: "boolean"
          }
        },
        required: [
          "enabled"
        ]
      }))
    })
  })

  describe("getAutoNotchEnabled", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BC0;"))

        driver.send("BC00;")
      })
      await expect(genericTransceiver.getAutoNotchEnabled()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BC0;"))

        driver.send("BC01;")
      })
      await expect(genericTransceiver.getAutoNotchEnabled()).resolves.toEqual(true)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAutoNotchEnabled')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("getAutoInformation", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AI;"))

        driver.send("AI0;")
      })
      await expect(genericTransceiver.getAutoInformation()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AI;"))

        driver.send("AI1;")
      })
      await expect(genericTransceiver.getAutoInformation()).resolves.toEqual(true)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAutoInformation')).toEqual(expect.objectContaining({
        properties: {}
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
        },
        required: [
          "enabled"
        ]
      }))
    })
  })

  describe("setVFOFrequency", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setVFOFrequency({ frequency: 14_250_000, vfo: VFOType.Current })
      expect(driver.writeString).toHaveBeenCalledWith("FA014250000;")

      await genericTransceiver.setVFOFrequency({ frequency: 7_250_000, vfo: VFOType.Other })
      expect(driver.writeString).toHaveBeenCalledWith("FB007250000;")
    })

    test("specifies the schema correctly", () => {
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

  describe("getManualNotchFrequencyOffset", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BP01;"))

        driver.send("BP01300;")
      })
      await expect(genericTransceiver.getManualNotchFrequencyOffset()).resolves.toEqual(3000 / 3200)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BP01;"))

        driver.send("BP01050;")
      })
      await expect(genericTransceiver.getManualNotchFrequencyOffset()).resolves.toEqual(500 / 3200)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getManualNotchFrequencyOffset')).toEqual(
        expect.objectContaining({
          properties: {},
        })
      )
    })
  })

  describe("getManualNotchEnabled", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BP00;"))

        driver.send("BP00000;")
      })
      await expect(genericTransceiver.getManualNotchEnabled()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BP00;"))

        driver.send("BP00001;")
      })
      await expect(genericTransceiver.getManualNotchEnabled()).resolves.toEqual(true)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getManualNotchEnabled')).toEqual(
        expect.objectContaining({
          properties: {},
        })
      )
    })
  })

  describe("setManualNotchEnabled", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setManualNotchEnabled({ enabled: false })
      expect(driver.writeString).toHaveBeenCalledWith("BP00000;")

      await genericTransceiver.setManualNotchEnabled({ enabled: true })
      expect(driver.writeString).toHaveBeenCalledWith("BP00001;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setManualNotchEnabled')).toEqual(
        expect.objectContaining({
          properties: {
            enabled: {
              type: "boolean"
            },
          },
          required: [
            "enabled"
          ]
        })
      )
    })
  })

  describe("setManualNotchFrequencyOffset", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setManualNotchFrequencyOffset({ frequencyOffset: 0 })
      expect(driver.writeString).toHaveBeenCalledWith("BP01000;")

      await genericTransceiver.setManualNotchFrequencyOffset({ frequencyOffset: 0.45 })
      expect(driver.writeString).toHaveBeenCalledWith("BP01144;")

      await genericTransceiver.setManualNotchFrequencyOffset({ frequencyOffset: 1 })
      expect(driver.writeString).toHaveBeenCalledWith("BP01320;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setManualNotchFrequencyOffset')).toEqual(
        expect.objectContaining({
          properties: {
            frequencyOffset: {
              maximum: 1,
              minimum: 0,
              type: "number"
            },
          },
          required: [
            "frequencyOffset"
          ]
        })
      )
    })
  })

  describe("parseManualNotchFrequencyResponse", () => {
    test("it returns the manual notch enabled state", () => {
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("BP01000;")).toEqual(0)
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("BP01001;")).toEqual(10/3200)
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("BP01320;")).toEqual(1)
    })
  })

  describe("getTXBusy", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BY;"))

        driver.send("BY00;")
      })
      await expect(genericTransceiver.getTXBusy()).resolves.toBe(true)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BY;"))

        driver.send("BY10;")
      })
      await expect(genericTransceiver.getTXBusy()).resolves.toBe(false)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getTXBusy')).toEqual(
        expect.objectContaining({
          properties: {}
        })
      )
    })
  })

  describe("parseTXBusyResponse", () => {
    test("it returns the tx busy state", () => {
      expect(genericTransceiver["parseTXBusyResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseTXBusyResponse"]("BY00;")).toEqual(true)
      expect(genericTransceiver["parseTXBusyResponse"]("BY10;")).toEqual(false)
    })
  })

  describe("getDCSCode", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CN01;"))

        driver.send("CN01000;")
      })
      await expect(genericTransceiver.getDCSCode()).resolves.toBe(0o23)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CN01;"))

        driver.send("CN01015;")
      })
      await expect(genericTransceiver.getDCSCode()).resolves.toBe(0o74)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CN01;"))

        driver.send("CN01103;")
      })
      await expect(genericTransceiver.getDCSCode()).resolves.toBe(0o754)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getDCSCode')).toEqual(
        expect.objectContaining({
          properties: {},
        })
      )
    })
  })

  describe("setDCSCode", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setDCSCode({ code: 0o23 })
      expect(driver.writeString).toHaveBeenCalledWith("CN01000;")

      await genericTransceiver.setDCSCode({ code: 0o205 })
      expect(driver.writeString).toHaveBeenCalledWith("CN01033;")

      await genericTransceiver.setDCSCode({ code: 0o754 })
      expect(driver.writeString).toHaveBeenCalledWith("CN01103;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setDCSCode')).toEqual(
        expect.objectContaining({
          properties: {
            code: {
              enum: [
                19,
                21,
                22,
                25,
                26,
                30,
                35,
                39,
                41,
                43,
                44,
                53,
                57,
                58,
                59,
                60,
                76,
                77,
                78,
                82,
                85,
                89,
                90,
                92,
                99,
                101,
                106,
                109,
                110,
                114,
                117,
                122,
                124,
                133,
                138,
                147,
                149,
                150,
                163,
                164,
                165,
                166,
                169,
                170,
                173,
                177,
                179,
                181,
                182,
                185,
                188,
                198,
                201,
                205,
                213,
                217,
                218,
                227,
                230,
                233,
                238,
                244,
                245,
                249,
                265,
                266,
                267,
                275,
                281,
                282,
                293,
                294,
                298,
                300,
                301,
                306,
                308,
                309,
                310,
                323,
                326,
                334,
                339,
                342,
                346,
                358,
                373,
                390,
                394,
                404,
                407,
                409,
                410,
                428,
                434,
                436,
                451,
                458,
                467,
                473,
                474,
                476,
                483,
                492,
              ],
              type: "number"
            },
          },
          required: [
            "code"
          ]
        })
      )
    })
  })

  describe("getCTCSSFrequency", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CN00;"))

        driver.send("CN00000;")
      })
      await expect(genericTransceiver.getCTCSSFrequency()).resolves.toBe(67)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CN00;"))

        driver.send("CN00049;")
      })
      await expect(genericTransceiver.getCTCSSFrequency()).resolves.toBe(254.1)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getCTCSSFrequency')).toEqual(
        expect.objectContaining({
          properties: {},
        })
      )
    })
  })

  describe("parseCTCSSFrequencyResponse", () => {
    test("it returns the break in state", () => {
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("ABC;")).toEqual(undefined)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN00000;")).toEqual(67.0)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN00001;")).toEqual(69.3)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN00030;")).toEqual(171.3)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN00049;")).toEqual(254.1)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN00050;")).toEqual(undefined)
    })
  })

  describe("setCTCSSFrequency", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setCTCSSFrequency({ frequency: 67 })
      expect(driver.writeString).toHaveBeenCalledWith("CN00000;")

      await genericTransceiver.setCTCSSFrequency({ frequency: 110.9 })
      expect(driver.writeString).toHaveBeenCalledWith("CN00015;")

      await genericTransceiver.setCTCSSFrequency({ frequency: 254.1 })
      expect(driver.writeString).toHaveBeenCalledWith("CN00049;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setCTCSSFrequency')).toEqual(
        expect.objectContaining({
          properties: {
            frequency: {
              enum: CTCSSFrequencies,
              type: "number"
            }
          },
          required: [
            "frequency"
          ]
        })
      )
    })
  })

  describe("getVFOFrequency", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("FA;"))

        driver.send("FB012345;FA014250000;")
      })
      await expect(genericTransceiver.getVFOFrequency({ vfo: VFOType.Current })).resolves.toBe(14_250_000)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("FB;"))

        driver.send("FA012345;FB007200000;")
      })
      await expect(genericTransceiver.getVFOFrequency({ vfo: VFOType.Other })).resolves.toBe(7_200_000)
    })

    test("specifies the schema correctly", () => {
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

  describe("scrollMemoryChannel", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.scrollMemoryChannel({ direction: Direction.Up })
      expect(driver.writeString).toHaveBeenCalledWith("CH0;")

      await genericTransceiver.scrollMemoryChannel({ direction: Direction.Down })
      expect(driver.writeString).toHaveBeenCalledWith("CH1;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('scrollMemoryChannel')).toEqual(
        expect.objectContaining({
          properties: {
            direction: {
              enum: [
                "Up",
                "Down"
              ],
              type: "string"
            }
          },
          required: [
            "direction"
          ]
        })
      )
    })
  })

  describe("changeBand", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.changeBand({ direction: Direction.Down })
      expect(driver.writeString).toHaveBeenCalledWith("BD0;")

      await genericTransceiver.changeBand({ direction: Direction.Up })
      expect(driver.writeString).toHaveBeenCalledWith("BU0;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('changeBand')).toEqual(
        expect.objectContaining({
          properties: {
            direction: {
              enum: [
                "Up",
                "Down"
              ],
              type: "string"
            }
          },
          required: [
            "direction"
          ]
        })
      )
    })
  })

  describe("getBreakInEnabled", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BI;"))

        driver.send("BI0;")
      })
      await expect(genericTransceiver.getBreakInEnabled()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BI;"))

        driver.send("BI1;")
      })
      await expect(genericTransceiver.getBreakInEnabled()).resolves.toEqual(true)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getBreakInEnabled')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("parseBreakIn", () => {
    test("it returns the break in state", () => {
      expect(genericTransceiver["parseBreakInResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseBreakInResponse"]("BI0;")).toEqual(false)
      expect(genericTransceiver["parseBreakInResponse"]("BI1;")).toEqual(true)
    })
  })

  describe("setBreakInEnabled", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setBreakInEnabled({ enabled: false })
      expect(driver.writeString).toHaveBeenCalledWith("BI0;")

      await genericTransceiver.setBreakInEnabled({ enabled: true })
      expect(driver.writeString).toHaveBeenCalledWith("BI1;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setBreakInEnabled')).toEqual(expect.objectContaining({
        properties: {
          enabled: {
            type: "boolean"
          }
        },
        required: [
          "enabled"
        ]
      }))
    })
  })


  describe("getAGCState", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GT0;"))

        driver.send("GT00;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Off })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GT0;"))

        driver.send("GT01;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Fast })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GT0;"))

        driver.send("GT02;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Mid })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GT0;"))

        driver.send("GT03;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Slow })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GT0;"))

        driver.send("GT04;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: true, attack: AGCAttack.Fast })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GT0;"))

        driver.send("GT05;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: true, attack: AGCAttack.Mid })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GT0;"))

        driver.send("GT06;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: true, attack: AGCAttack.Slow })
    })

    test("specifies the schema correctly", () => {
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

  describe("parseAGCStateResponse", () => {
    test("it returns the AGC state", () => {
      expect(genericTransceiver["parseAGCStateResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseAGCStateResponse"]("GT00;")).toEqual({ attack: AGCAttack.Off, auto: false })
      expect(genericTransceiver["parseAGCStateResponse"]("GT01;")).toEqual({ attack: AGCAttack.Fast, auto: false })
      expect(genericTransceiver["parseAGCStateResponse"]("GT02;")).toEqual({ attack: AGCAttack.Mid, auto: false })
      expect(genericTransceiver["parseAGCStateResponse"]("GT03;")).toEqual({ attack: AGCAttack.Slow, auto: false })
      expect(genericTransceiver["parseAGCStateResponse"]("GT04;")).toEqual({ attack: AGCAttack.Fast, auto: true })
      expect(genericTransceiver["parseAGCStateResponse"]("GT05;")).toEqual({ attack: AGCAttack.Mid, auto: true })
      expect(genericTransceiver["parseAGCStateResponse"]("GT06;")).toEqual({ attack: AGCAttack.Slow, auto: true })
    })
  })

  describe("setAGCAttack", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Auto })
      expect(driver.writeString).toHaveBeenCalledWith("GT04;")

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Fast })
      expect(driver.writeString).toHaveBeenCalledWith("GT01;")

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Mid })
      expect(driver.writeString).toHaveBeenCalledWith("GT02;")

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Slow })
      expect(driver.writeString).toHaveBeenCalledWith("GT03;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setAGCAttack')).toEqual(
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
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC000;")).toEqual(AntennaTunerState.Off)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC001;")).toEqual(AntennaTunerState.On)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC002;")).toEqual(AntennaTunerState.Tuning)
    })
  })

  describe("parseAFGainResponse", () => {
    test("it returns the AF gain", () => {
      expect(genericTransceiver["parseAFGainResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseAFGainResponse"]("AG0000;")).toEqual(0)
      expect(genericTransceiver["parseAFGainResponse"]("AG0255;")).toEqual(1)
      expect(genericTransceiver["parseAFGainResponse"]("AG0128;")).toEqual(128 / 255)
      expect(genericTransceiver["parseAFGainResponse"]("AG0051;")).toEqual(0.2)
    })
  })

  describe("parseManualNotchEnabledResponse", () => {
    test("it returns the manual notch enabled state", () => {
      expect(genericTransceiver["parseManualNotchEnabledResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseManualNotchEnabledResponse"]("BP00000;")).toEqual(false)
      expect(genericTransceiver["parseManualNotchEnabledResponse"]("BP00001;")).toEqual(true)
    })
  })
})
