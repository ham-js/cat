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
