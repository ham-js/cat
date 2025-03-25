import { describe, expect, test } from "@jest/globals"
import { AGCAttack } from "devices/transceivers/base/AGCAttack"
import { VFOType } from "devices/transceivers/base/VFOType"
import { VirtualTransceiver } from "devices/transceivers/VirtualTransceiver"
import { DummyDriver } from "drivers/DummyDriver"

describe("Virtual Transceiver", () => {
  describe("setAGC", () => {
    test("it sets the AGC", async () => {
      const virtualTransceiver = new VirtualTransceiver(new DummyDriver())

      await virtualTransceiver.setAGC({ attack: AGCAttack.Fast })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Fast)

      await virtualTransceiver.setAGC({ attack: AGCAttack.Auto })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Auto)

      await virtualTransceiver.setAGC({ attack: AGCAttack.Slow })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Slow)

      await virtualTransceiver.setAGC({ attack: AGCAttack.Mid })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Mid)

      await virtualTransceiver.setAGC({ attack: AGCAttack.Off })
      expect(virtualTransceiver.state.agcAttack).toEqual(AGCAttack.Off)
     })
  })

  describe("setVFO", () => {
    test("it sets the VFO", async () => {
      const virtualTransceiver = new VirtualTransceiver(new DummyDriver())
      virtualTransceiver.state.currentVFO = VFOType.A

      await virtualTransceiver.setVFO({ frequency: 1, vfo: VFOType.A })
      expect(virtualTransceiver.state.vfo[VFOType.A]).toBe(1)

      await virtualTransceiver.setVFO({ frequency: 2, vfo: VFOType.B })
      expect(virtualTransceiver.state.vfo[VFOType.B]).toBe(2)

      await virtualTransceiver.setVFO({ frequency: 3, vfo: VFOType.Current })
      expect(virtualTransceiver.state.vfo[VFOType.A]).toBe(3)

      await virtualTransceiver.setVFO({ frequency: 4, vfo: VFOType.Other })
      expect(virtualTransceiver.state.vfo[VFOType.B]).toBe(4)

      virtualTransceiver.state.currentVFO = VFOType.B
      await virtualTransceiver.setVFO({ frequency: 5, vfo: VFOType.Current })
      expect(virtualTransceiver.state.vfo[VFOType.B]).toBe(5)
      await virtualTransceiver.setVFO({ frequency: 6, vfo: VFOType.Other })
      expect(virtualTransceiver.state.vfo[VFOType.A]).toBe(6)
     })
  })

  describe("getVFO", () => {
    test("reads the VFO", async () => {
      const virtualTransceiver = new VirtualTransceiver(new DummyDriver())

      virtualTransceiver.state.vfo[VFOType.A] = 1
      virtualTransceiver.state.vfo[VFOType.B] = 2
      virtualTransceiver.state.currentVFO = VFOType.A

      await expect(virtualTransceiver.getVFO({ vfo: VFOType.A })).resolves.toBe(1)
      await expect(virtualTransceiver.getVFO({ vfo: VFOType.B })).resolves.toBe(2)
      await expect(virtualTransceiver.getVFO({ vfo: VFOType.Current })).resolves.toBe(1)
      await expect(virtualTransceiver.getVFO({ vfo: VFOType.Other })).resolves.toBe(2)

      virtualTransceiver.state.currentVFO = VFOType.B
      await expect(virtualTransceiver.getVFO({ vfo: VFOType.Current })).resolves.toBe(2)
      await expect(virtualTransceiver.getVFO({ vfo: VFOType.Other })).resolves.toBe(1)
    })
  })
})
