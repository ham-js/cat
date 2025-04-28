import { beforeEach, describe, expect, jest, test } from "@jest/globals"
import { Transceiver } from "./Transceiver"
import { DeviceType } from "../../base/DeviceType"
import { TestDriver } from "../../../test/utils/TestDriver"
import { firstValueFrom, take, toArray } from "rxjs"
import { VFOType } from "./VFOType"
import { TransceiverEventType } from "./TransceiverEvent"

class StringTransceiver extends Transceiver<string> {
  data = this.driver.stringData()
}

class Uint8ArrayTransceiver extends Transceiver<Uint8Array> {
  data = this.driver.data
}

describe("Transceiver", () => {
  test("device vendor", () => expect(Transceiver.deviceType).toBe(DeviceType.Transceiver))

  describe("events", () => {
    test("it polls the VFOs", async () => {
      jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

      const transceiver = new Transceiver(new TestDriver())
      jest.spyOn(transceiver, "getVFOFrequency")
        .mockImplementation(({ vfo }) => {
          if (vfo === VFOType.Current) return Promise.resolve(14_250_300)

          return Promise.resolve(7_200_000)
        })

      await expect(
        firstValueFrom(
          transceiver.events
            .pipe(
              take(2),
              toArray()
            )
        )
      ).resolves.toEqual([
        {
          frequency: 14_250_300,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.VFO,
          vfo: VFOType.Current,
        },
        {
          frequency: 7_200_000,
          timestamp: new Date("1992-01-22T13:00:00Z"),
          type: TransceiverEventType.VFO,
          vfo: VFOType.Other,
        }
      ])
    })

    test("it stops polling when the device is closed", async () => {
      const transceiver = new Transceiver(new TestDriver())
      jest.spyOn(transceiver, "getVFOFrequency")
        .mockImplementation(() => Promise.resolve(7_200_000))

      const subscription = transceiver.events.subscribe()

      expect(subscription.closed).toBe(false)
      await transceiver.close()
      expect(subscription.closed).toBe(true)
    })
  })

  describe("readResponse", () => {
    const driver = new TestDriver()
    const stringTransceiver = new StringTransceiver(driver)
    const uint8ArrayTransceiver = new Uint8ArrayTransceiver(driver)

    beforeEach(() => {
      jest.spyOn(driver, "writeString")
    })

    test("it sends a string command and reads back the response", async () => {
      const result = stringTransceiver["readResponse"]("TEST", (response) => response.length > 3 ? response.charAt(2) : null)

      expect(driver.writeString).toHaveBeenCalledWith("TEST")
      driver.send("AB;") // this returns null in the map fn
      driver.send("CDE;")

      await expect(result).resolves.toEqual("E")
    })

    test("it sends a byte command and reads back the response", async () => {
      const result = uint8ArrayTransceiver["readResponse"](new Uint8Array([65, 66, 67]), (response) => response.length > 3 ? response[2] : null)

      expect(driver.write).toHaveBeenCalledWith(new Uint8Array([65, 66, 67]))
      driver.send(new Uint8Array([65, 66, 67])) // this returns null in the map fn
      driver.send(new Uint8Array([68, 69, 70, 71]))

      await expect(result).resolves.toEqual(70)
    })

    test("it implements a timeout for string commands", async () => {
      jest.useFakeTimers()

      const result = stringTransceiver["readResponse"]("TEST", (response) => response.length > 3 ? response.charAt(2) : null)

      // this is a trick to prevent the promise to reject before jest's expect can handle the error because we advance the timer for the timeout
      try {
        return expect(result).rejects.toThrow("Timeout has occurred")
      } finally {
        await jest.advanceTimersToNextTimerAsync()
      }
    })

    test("it implements a timeout for byte commands", async () => {
      jest.useFakeTimers()

      const result = uint8ArrayTransceiver["readResponse"](new Uint8Array([65, 66, 67]), (response) => response.length > 3 ? response[2] : null)

      // this is a trick to prevent the promise to reject before jest's expect can handle the error because we advance the timer for the timeout
      try {
        return expect(result).rejects.toThrow("Timeout has occurred")
      } finally {
        await jest.advanceTimersToNextTimerAsync()
      }
    })
  })

})
