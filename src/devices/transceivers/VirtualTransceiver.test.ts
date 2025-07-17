import { describe, expect, test } from "@jest/globals"
import { DeviceType } from "../base/DeviceType"
import { DriverType, DummyDriver } from "../../drivers"
import { AGCAttack } from "./base/AGCAttack"
import { TransceiverVendor } from "./base/TransceiverVendor"
import { VFOType } from "./base/VFOType"
import { VirtualTransceiver } from "./VirtualTransceiver"

describe("Virtual Transceiver", () => {
  test("device type", () => expect(VirtualTransceiver.deviceType).toBe(DeviceType.Transceiver))
  test("device vendor", () => expect(VirtualTransceiver.deviceVendor).toBe(TransceiverVendor.Virtual))
  test("supportedDrivers", () => expect(VirtualTransceiver.supportedDrivers).toEqual([DriverType.DummyDriver]))

  describe("setAGC", () => {
    test("it sets the AGC", async () => {
      const virtualTransceiver = new VirtualTransceiver(new DummyDriver())

      await virtualTransceiver.setAGCAttack({ attack: AGCAttack.Fast })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Fast)

      await virtualTransceiver.setAGCAttack({ attack: AGCAttack.Auto })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Auto)

      await virtualTransceiver.setAGCAttack({ attack: AGCAttack.Slow })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Slow)

      await virtualTransceiver.setAGCAttack({ attack: AGCAttack.Mid })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Mid)

      await virtualTransceiver.setAGCAttack({ attack: AGCAttack.Off })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Off)
     })
  })

  describe("setVFO", () => {
    test("it sets the VFO", async () => {
      const virtualTransceiver = new VirtualTransceiver(new DummyDriver())

      await virtualTransceiver.setVFOFrequency({ frequency: 1, vfo: VFOType.Current })
      expect(virtualTransceiver.state.vfo[VFOType.Current]).toBe(1)

      await virtualTransceiver.setVFOFrequency({ frequency: 2, vfo: VFOType.Other })
      expect(virtualTransceiver.state.vfo[VFOType.Other]).toBe(2)
    })
  })

  describe("getVFO", () => {
    test("reads the VFO", async () => {
      const virtualTransceiver = new VirtualTransceiver(new DummyDriver())

      virtualTransceiver.state.vfo[VFOType.Current] = 1
      virtualTransceiver.state.vfo[VFOType.Other] = 2

      await expect(virtualTransceiver.getVFOFrequency({ vfo: VFOType.Current })).resolves.toBe(1)
      await expect(virtualTransceiver.getVFOFrequency({ vfo: VFOType.Other })).resolves.toBe(2)
    })
  })
})
