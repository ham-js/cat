import { describe, expect, test } from "@jest/globals"

import { DummyDriver } from "../../communication-drivers/DummyDriver"
import { VirtualDriver } from "./VirtualDriver"
import { TransceiverVFOType } from "./base/TransceiverVFOType"
import { TransceiverAGCAttack } from "./base/TransceiverAGCAttack"

describe("Virtual Driver", () => {
  describe("setAGC", () => {
    test("it sets the AGC", async () => {
      const virtualDriver = new VirtualDriver(new DummyDriver())

      await virtualDriver.sendCommand("setAGC", { attack: TransceiverAGCAttack.Fast })
      expect(virtualDriver.state.agcAttack).toEqual(TransceiverAGCAttack.Fast)

      await virtualDriver.sendCommand("setAGC", { attack: TransceiverAGCAttack.Auto })
      expect(virtualDriver.state.agcAttack).toEqual(TransceiverAGCAttack.Auto)

      await virtualDriver.sendCommand("setAGC", { attack: TransceiverAGCAttack.Slow })
      expect(virtualDriver.state.agcAttack).toEqual(TransceiverAGCAttack.Slow)

      await virtualDriver.sendCommand("setAGC", { attack: TransceiverAGCAttack.Mid })
      expect(virtualDriver.state.agcAttack).toEqual(TransceiverAGCAttack.Mid)

      await virtualDriver.sendCommand("setAGC", { attack: TransceiverAGCAttack.Off })
      expect(virtualDriver.state.agcAttack).toEqual(TransceiverAGCAttack.Off)
     })
  })

  describe("setVFO", () => {
    test("it sets the VFO", async () => {
      const virtualDriver = new VirtualDriver(new DummyDriver())
      virtualDriver.state.currentVFO = TransceiverVFOType.A

      await virtualDriver.sendCommand("setVFO", { frequency: 1, vfo: TransceiverVFOType.A })
      expect(virtualDriver.state.vfo[TransceiverVFOType.A]).toBe(1)

      await virtualDriver.sendCommand("setVFO", { frequency: 2, vfo: TransceiverVFOType.B })
      expect(virtualDriver.state.vfo[TransceiverVFOType.B]).toBe(2)

      await virtualDriver.sendCommand("setVFO", { frequency: 3, vfo: TransceiverVFOType.Current })
      expect(virtualDriver.state.vfo[TransceiverVFOType.A]).toBe(3)

      await virtualDriver.sendCommand("setVFO", { frequency: 4, vfo: TransceiverVFOType.Other })
      expect(virtualDriver.state.vfo[TransceiverVFOType.B]).toBe(4)

      virtualDriver.state.currentVFO = TransceiverVFOType.B
      await virtualDriver.sendCommand("setVFO", { frequency: 5, vfo: TransceiverVFOType.Current })
      expect(virtualDriver.state.vfo[TransceiverVFOType.B]).toBe(5)
      await virtualDriver.sendCommand("setVFO", { frequency: 6, vfo: TransceiverVFOType.Other })
      expect(virtualDriver.state.vfo[TransceiverVFOType.A]).toBe(6)
     })
  })

  describe("getVFO", () => {
    test("reads the VFO", async () => {
      const virtualDriver = new VirtualDriver(new DummyDriver())

      virtualDriver.state.vfo[TransceiverVFOType.A] = 1
      virtualDriver.state.vfo[TransceiverVFOType.B] = 2
      virtualDriver.state.currentVFO = TransceiverVFOType.A

      await expect(virtualDriver.sendCommand("getVFO", { vfo: TransceiverVFOType.A })).resolves.toBe(1)
      await expect(virtualDriver.sendCommand("getVFO", { vfo: TransceiverVFOType.B })).resolves.toBe(2)
      await expect(virtualDriver.sendCommand("getVFO", { vfo: TransceiverVFOType.Current })).resolves.toBe(1)
      await expect(virtualDriver.sendCommand("getVFO", { vfo: TransceiverVFOType.Other })).resolves.toBe(2)

      virtualDriver.state.currentVFO = TransceiverVFOType.B
      await expect(virtualDriver.sendCommand("getVFO", { vfo: TransceiverVFOType.Current })).resolves.toBe(2)
      await expect(virtualDriver.sendCommand("getVFO", { vfo: TransceiverVFOType.Other })).resolves.toBe(1)
    })
  })
})
