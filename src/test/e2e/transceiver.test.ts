import c from "ansi-colors"
import { TransceiverDevice } from "../../devices/transceivers/base/types/TransceiverDevice"
import { TransceiverDevices } from "../../devices/transceivers/TransceiverDevices"
import { beforeAll, describe, expect, test } from "@jest/globals"
import { clear, log } from "console"
import { prompt } from 'enquirer'

describe("end-to-end transceiver", () => {
  let device: TransceiverDevice

  beforeAll(async () => {
    clear()

    log(c.bold("⚡️ Welcome to the transceiver end-to-end test. This test will run commands against an actual device that you connect to your computer.\n"))
    log(c.bold.red("Make sure you have connected an appropriate dummy load to your transceiver!\n"))

    const { confirmDummyLoad, device: aDevice } = await prompt<{ confirmDummyLoad: boolean, device: TransceiverDevice }>([{
      choices: TransceiverDevices.map((device) => ({ name: `${device.deviceVendor} ${device.deviceName}`, value: device })),
      message: "Choose your transceiver",
      name: 'device',
      result(value) { return (this as any).map(value) },
      type: 'select'
    }, {
      message: c.bold.red("Have you connected an appropriate dummy load to your device?"),
      name: "confirmDummyLoad",
      type: "confirm"
    }])

    if (!confirmDummyLoad) throw new Error("Need to confirm dummy load")

    device = aDevice
  })

  test("works", async () => {
    expect(true).toBe(true)
  }, 10 * 60 * 1000) // 10 minutes timeout
})
