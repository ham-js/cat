import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { GenericTransceiver } from "./GenericTransceiver";
import { TestDriver } from "../../../test/utils/TestDriver";
import { DeviceType } from "../../base/DeviceType";
import { TransceiverVendor } from "../base/TransceiverVendor";
import { VFOType } from "../base/VFOType";
import { AGCAttack } from "../base/AGCAttack";
import { DeviceAgnosticDriverTypes } from "../../../drivers";
import { getTestDevice } from "../../../test/utils/getTestDevice";
import { AntennaTunerState } from "../base/AntennaTunerState";
import { Direction } from "../base/Direction";
import { CTCSSFrequencies } from "../base/CTCSSFrequencies";

describe("GenericTransceiver", () => {
  const textEncoder = new TextEncoder()
  const driver = new TestDriver()
  const genericTransceiver = new (getTestDevice(GenericTransceiver))(driver)

  beforeEach(async () => {
    jest.spyOn(driver, "writeString")

    await genericTransceiver.open()
  })

  afterEach(async () => {
    jest.restoreAllMocks()

    await genericTransceiver.close()
  })

  test("device type", () => expect(GenericTransceiver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(GenericTransceiver.deviceVendor).toBe(TransceiverVendor.Kenwood))
  test("supportedDrivers", () => expect(GenericTransceiver.supportedDrivers).toEqual([...DeviceAgnosticDriverTypes]))

  describe("getTXBusy", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BY;"))

        driver.send("BY0;")
      })
      await expect(genericTransceiver.getTXBusy()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BY;"))

        driver.send("BY1;")
      })
      await expect(genericTransceiver.getTXBusy()).resolves.toEqual(true)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getTXBusy')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("parseTXBusyResponse", () => {
    test("it returns the tx bust state", () => {
      expect(genericTransceiver["parseTXBusyResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseTXBusyResponse"]("BY0;")).toEqual(false)
      expect(genericTransceiver["parseTXBusyResponse"]("BY1;")).toEqual(true)
    })
  })

  describe("getRITEnabled", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("RT;"))

        driver.send("RT0;")
      })
      await expect(genericTransceiver.getRITEnabled()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("RT;"))

        driver.send("RT1;")
      })
      await expect(genericTransceiver.getRITEnabled()).resolves.toEqual(true)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getRITEnabled')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("getCTCSSFrequency", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CN;"))

        driver.send("CN00;")
      })
      await expect(genericTransceiver.getCTCSSFrequency()).resolves.toBe(67)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("CN;"))

        driver.send("CN49;")
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
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN00;")).toEqual(67.0)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN01;")).toEqual(69.3)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN30;")).toEqual(171.3)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN49;")).toEqual(254.1)
      expect(genericTransceiver["parseCTCSSFrequencyResponse"]("CN50;")).toEqual(undefined)
    })
  })

  describe("setCTCSSFrequency", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setCTCSSFrequency({ frequency: 67 })
      expect(driver.writeString).toHaveBeenCalledWith("CN00;")

      await genericTransceiver.setCTCSSFrequency({ frequency: 110.9 })
      expect(driver.writeString).toHaveBeenCalledWith("CN15;")

      await genericTransceiver.setCTCSSFrequency({ frequency: 254.1 })
      expect(driver.writeString).toHaveBeenCalledWith("CN49;")
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

  describe("parseRITEnabledResponse", () => {
    test("it returns the break in state", () => {
      expect(genericTransceiver["parseRITEnabledResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseRITEnabledResponse"]("RT0;")).toEqual(false)
      expect(genericTransceiver["parseRITEnabledResponse"]("RT1;")).toEqual(true)
    })
  })

  describe("setRITEnabled", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setRITEnabled({ enabled: false })
      expect(driver.writeString).toHaveBeenCalledWith("RT0;")

      await genericTransceiver.setRITEnabled({ enabled: true })
      expect(driver.writeString).toHaveBeenCalledWith("RT1;")
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

  describe("parseBreakInResponse", () => {
    test("it returns the break in state", () => {
      expect(genericTransceiver["parseBreakInResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseBreakInResponse"]("BI0;")).toEqual(false)
      expect(genericTransceiver["parseBreakInResponse"]("BI1;")).toEqual(true)
    })
  })

  describe("setManualNotchEnabled", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setManualNotchEnabled({ enabled: false })
      expect(driver.writeString).toHaveBeenCalledWith("NT0;")

      await genericTransceiver.setManualNotchEnabled({ enabled: true })
      expect(driver.writeString).toHaveBeenCalledWith("NT1;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setManualNotchEnabled')).toEqual(expect.objectContaining({
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

  describe("setManualNotchFrequencyOffset", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setManualNotchFrequencyOffset({ frequencyOffset: 0 })
      expect(driver.writeString).toHaveBeenCalledWith("BP000;")

      await genericTransceiver.setManualNotchFrequencyOffset({ frequencyOffset: 0.5 })
      expect(driver.writeString).toHaveBeenCalledWith("BP128;")

      await genericTransceiver.setManualNotchFrequencyOffset({ frequencyOffset: 1 })
      expect(driver.writeString).toHaveBeenCalledWith("BP255;")
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

  describe("setBand", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setBand({ band: "160m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU000;")

      await genericTransceiver.setBand({ band: "80m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU001;")

      await genericTransceiver.setBand({ band: "40m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU002;")

      await genericTransceiver.setBand({ band: "30m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU003;")

      await genericTransceiver.setBand({ band: "20m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU004;")

      await genericTransceiver.setBand({ band: "17m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU005;")

      await genericTransceiver.setBand({ band: "15m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU006;")

      await genericTransceiver.setBand({ band: "13m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU007;")

      await genericTransceiver.setBand({ band: "10m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU008;")

      await genericTransceiver.setBand({ band: "6m" })
      expect(driver.writeString).toHaveBeenCalledWith("BU009;")

      await genericTransceiver.setBand({ band: "General" })
      expect(driver.writeString).toHaveBeenCalledWith("BU010;")
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('setBand')).toEqual(expect.objectContaining({
        properties: {
          band: {
            enum: [
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


  describe("getManualNotchFrequencyOffset", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BP;"))

        driver.send("BP000;")
      })
      await expect(genericTransceiver.getManualNotchFrequencyOffset()).resolves.toEqual(0)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BP;"))

        driver.send("BP128;")
      })
      await expect(genericTransceiver.getManualNotchFrequencyOffset()).resolves.toEqual(128 / 255)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("BP;"))

        driver.send("BP255;")
      })
      await expect(genericTransceiver.getManualNotchFrequencyOffset()).resolves.toEqual(1)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getManualNotchFrequencyOffset')).toEqual(
        expect.objectContaining({
          properties: {},
        })
      )
    })
  })

  describe("parseManualNotchFrequencyResponse", () => {
    test("it returns the manual notch enabled state", () => {
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("BP000;")).toEqual(0)
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("BP001;")).toEqual(1/255)
      expect(genericTransceiver["parseManualNotchFrequencyResponse"]("BP255;")).toEqual(1)
    })
  })

  describe("getManualNotchEnabled", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("NT;"))

        driver.send("NT0;")
      })
      await expect(genericTransceiver.getManualNotchEnabled()).resolves.toEqual(false)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("NT;"))

        driver.send("NT1;")
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

  describe("parseManualNotchEnabledResponse", () => {
    test("it returns the manual notch enabled state", () => {
      expect(genericTransceiver["parseManualNotchEnabledResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseManualNotchEnabledResponse"]("NT0;")).toEqual(false)
      expect(genericTransceiver["parseManualNotchEnabledResponse"]("NT1;")).toEqual(true)
    })
  })

  describe("changeBand", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.changeBand({ direction: Direction.Down })
      expect(driver.writeString).toHaveBeenCalledWith("BD;")

      await genericTransceiver.changeBand({ direction: Direction.Up })
      expect(driver.writeString).toHaveBeenCalledWith("BU;")
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

  describe("getAGCState", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GC;"))

        driver.send("GC0;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Off })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GC;"))

        driver.send("GC1;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Slow })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GC;"))

        driver.send("GC2;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Mid })

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("GC;"))

        driver.send("GC3;")
      })
      await expect(genericTransceiver.getAGCState()).resolves.toEqual({ auto: false, attack: AGCAttack.Fast })
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAGCState')).toEqual(
        expect.objectContaining({
          properties: {},
        })
      )
    })
  })

  describe("parseAGCAttackResponse", () => {
    test("it parses the agc attack correctly", () => {
      expect(genericTransceiver["parseAGCAttackResponse"]("ABC;")).toEqual(undefined)
      expect(genericTransceiver["parseAGCAttackResponse"]("GC0;")).toEqual(AGCAttack.Off)
      expect(genericTransceiver["parseAGCAttackResponse"]("GC1;")).toEqual(AGCAttack.Slow)
      expect(genericTransceiver["parseAGCAttackResponse"]("GC2;")).toEqual(AGCAttack.Mid)
      expect(genericTransceiver["parseAGCAttackResponse"]("GC3;")).toEqual(AGCAttack.Fast)
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

        driver.send("AC010;")
      })
      await expect( genericTransceiver.getAntennaTunerState()).resolves.toEqual(AntennaTunerState.On)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC100;")
      })
      await expect(genericTransceiver.getAntennaTunerState()).resolves.toEqual(AntennaTunerState.Off)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC110;")
      })
      await expect( genericTransceiver.getAntennaTunerState()).resolves.toEqual(AntennaTunerState.On)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC000;")
      })
      await expect(genericTransceiver.getAntennaTunerState({ rx: true })).resolves.toEqual(AntennaTunerState.Off)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC010;")
      })
      await expect(genericTransceiver.getAntennaTunerState({ rx: true })).resolves.toEqual(AntennaTunerState.Off)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC100;")
      })
      await expect(genericTransceiver.getAntennaTunerState({ rx: true })).resolves.toEqual(AntennaTunerState.On)


      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC110;")
      })
      await expect(genericTransceiver.getAntennaTunerState({ rx: true })).resolves.toEqual(AntennaTunerState.On)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AC;"))

        driver.send("AC001;")
      })
      await expect( genericTransceiver.getAntennaTunerState()).resolves.toEqual(AntennaTunerState.Tuning)
    })

    test("specifies the parameter type correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAntennaTunerState')).toEqual(
        expect.objectContaining({
          properties: {},
        })
      )
    })
  })

  describe("parseAntennaTunerStateResponse", () => {
    test("it parses the antenna tuner state correctly", () => {
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC000;")).toEqual(AntennaTunerState.Off)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC010;")).toEqual(AntennaTunerState.On)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC100;")).toEqual(AntennaTunerState.Off)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC110;")).toEqual(AntennaTunerState.On)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC000;", true)).toEqual(AntennaTunerState.Off)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC010;", true)).toEqual(AntennaTunerState.Off)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC100;", true)).toEqual(AntennaTunerState.On)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC110;", true)).toEqual(AntennaTunerState.On)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("AC001;", true)).toEqual(AntennaTunerState.Tuning)
      expect(genericTransceiver["parseAntennaTunerStateResponse"]("JB007;", true)).toEqual(null)
    })
  })

  describe("getVFOFrequency", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("FA;"))

        driver.send(`FB00012345;FA00014250000;`)
      })
      await expect(genericTransceiver.getVFOFrequency({ vfo: VFOType.Current })).resolves.toBe(14_250_000)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("FB;"))

        driver.send(`FA00012345;FB00007200000;`)
      })
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

  describe("getAFGain", () => {
    test("implements the command correctly", async () => {
      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG;"))

        driver.send("AG000;")
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(0)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG;"))

        driver.send("AG255;")
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(1)

      driver.write.mockImplementationOnce((data) => {
        expect(data).toEqual(textEncoder.encode("AG;"))

        driver.send("AG051;")
      })
      await expect(genericTransceiver.getAFGain()).resolves.toEqual(0.2)
    })

    test("specifies the schema correctly", () => {
      expect(genericTransceiver.getCommandSchema('getAFGain')).toEqual(expect.objectContaining({
        properties: {}
      }))
    })
  })

  describe("parseAFGainResponse", () => {
    test("it returns the AF gain", () => {
      expect(genericTransceiver["parseAFGainResponse"]("ABC;")).toEqual(null)
      expect(genericTransceiver["parseAFGainResponse"]("AG000;")).toEqual(0)
      expect(genericTransceiver["parseAFGainResponse"]("AG255;")).toEqual(1)
      expect(genericTransceiver["parseAFGainResponse"]("AG128;")).toEqual(128 / 255)
      expect(genericTransceiver["parseAFGainResponse"]("AG051;")).toEqual(0.2)
    })
  })

  describe("setAFGain", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAFGain({ gain: 0 })
      expect(driver.writeString).toHaveBeenCalledWith("AG000;")

      await genericTransceiver.setAFGain({ gain: 1 })
      expect(driver.writeString).toHaveBeenCalledWith("AG255;")

      await genericTransceiver.setAFGain({ gain: 0.5 })
      expect(driver.writeString).toHaveBeenCalledWith("AG128;")
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

  describe("setAGCAttack", () => {
    test("implements the command correctly", async () => {
      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Off })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC0;"))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Fast })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC3;"))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Mid })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC2;"))

      await genericTransceiver.setAGCAttack({ attack: AGCAttack.Slow })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC1;"))

      await genericTransceiver.setAGCAttack({ attack: "on" })
      expect(driver.write).toHaveBeenCalledWith(textEncoder.encode("GC4;"))
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
