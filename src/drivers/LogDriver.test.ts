import { beforeEach, describe, expect, test } from "@jest/globals";
import { LogDriver } from "./LogDriver";
import { firstValueFrom } from "rxjs";
import { Driver } from "./base/Driver";
import { TestDriver } from "../test/utils/TestDriver";

describe("LogDriver", () => {
  let wrappedDriver: Driver
  let logDriver: LogDriver

  beforeEach(() => {
    wrappedDriver = new TestDriver()
    logDriver = new LogDriver((wrappedDriver))
  })

  describe("observable", () => {
    test("proxies the wrapped driver observable", () => {
      expect(logDriver.data).toEqual(wrappedDriver.data)
    })
  })

  describe("isOpen", () => {
    test("delegates to wrapped driver", async () => {
      expect(logDriver.isOpen).toEqual(wrappedDriver.isOpen)

      await wrappedDriver.open?.()

      expect(logDriver.isOpen).toEqual(wrappedDriver.isOpen)

      await wrappedDriver.close?.()

      expect(logDriver.isOpen).toEqual(wrappedDriver.isOpen)
    })
  })

  describe("open", () => {
    test("opens the wrapped driver and logs the call", async () => {
      const result = firstValueFrom(logDriver.log)

      await logDriver.open()
      expect(wrappedDriver.open).toHaveBeenCalled()

      await expect(result).resolves.toEqual({
        timestamp: expect.any(Date),
        type: "open"
      })
    })
  })

  describe("close", () => {
    test("closes the wrapped driver and logs the call", async () => {
      await logDriver.open()

      const result = firstValueFrom(logDriver.log)
      await logDriver.close()

      expect(wrappedDriver.close).toHaveBeenCalled()
      await expect(result).resolves.toEqual({
        timestamp: expect.any(Date),
        type: "close"
      })
    })
  })

  describe("write", () => {
    test("logs the call and calls write on the wrapped driver", async () => {
      await logDriver.open()

      const result = firstValueFrom(logDriver.log)
      await logDriver.write(new Uint8Array([1, 2, 3]))

      expect(wrappedDriver.write).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]))
      await expect(result).resolves.toEqual({
        data: new Uint8Array([1, 2, 3]),
        timestamp: expect.any(Date),
        type: "write"
      })
    })
  })

  describe("stopLogging", () => {
    test("unsubscribes from the wrapped driver observable and completes the log", async () => {
      const subscription = logDriver.log.subscribe(() => {})

      await logDriver.open()
      logDriver.stopLogging()

      expect(subscription.closed).toBe(true)
      expect(logDriver["_observableSubscription"]?.closed).toBe(true)
    })
  })
})
