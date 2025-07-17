import c from "ansi-colors"
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals"
import { clear, log } from "console"
import { prompt } from 'enquirer'
import { Transceiver, Transceivers, VFOType } from "../../devices"
import { autoDetect } from "@serialport/bindings-cpp"
import { SerialPort } from "serialport"
import { SerialPortDriver } from "../../drivers"
import { Ajv } from "ajv"

const LONG_TIMEOUT = 10 * 60 * 1000
const TEST_FREQUENCIES = [
       136000, // 2200 m
       477000, // 630 m
      1900000, // 160 m
      3750000, // 80 m
      5100000, // 60 m
      7200000, // 40 m
     10150000, // 30 m
     14200000, // 20 m
     18100000, // 17 m
     21250000, // 15 m
     24900000, // 12 m
     28650000, // 10 m
     41000000, // 8 m
     51000000, // 6 m
     59000000, // 5 m
     70250000, // 4 m
    145500000, // 2 m
    219500000, // 1.25 m
    433500000, // 70 cm
    903500000, // 33 cm
   1250000000, // 23 cm
   2305000000, // 13 cm
]


describe("end-to-end transceiver", <T extends string | Uint8Array,>() => {
  let transceiver: Transceiver<T>

  beforeAll(async () => {
    clear()

    log(c.bold("⚡️ Welcome to the transceiver end-to-end test. This test will run commands against an actual device that you connect to your computer.\n"))
    log(c.bold.red("Make sure you have connected an appropriate dummy load to your transceiver!\n"))

    const transceiverChoices = Transceivers.map((transceiver) => ({ name: transceiver.displayName, value: transceiver }))
    const { confirmDummyLoad, TransceiverClass, serialPortPath, baudRate } = await prompt<{ confirmDummyLoad: boolean, TransceiverClass: typeof Transceiver, baudRate: number, serialPortPath: string }>([{
      message: c.bold.red("Have you connected an appropriate dummy load to your device?"),
      name: "confirmDummyLoad",
      type: "confirm"
    }, {
      choices: transceiverChoices,
      message: "Choose your transceiver",
      name: 'TransceiverClass',
      result() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this as any).focused.value
      },
      type: 'select'
    }, {
      choices: (await autoDetect().list()).map(({ path }) => ({ name: path, value: path })),
      message: "Choose the serial port",
      name: "serialPortPath",
      type: "select"
    }, {
      message: "Input the baud rate of your transceiver",
      min: 1,
      float: false,
      initial: 4800,
      name: "baudRate",
      type: "numeral"
    }])

    if (!confirmDummyLoad) throw new Error("Need to confirm dummy load")

    const serialPort = new SerialPort
    ({
      autoOpen: false,
      path: serialPortPath,
      baudRate
    })

    const driver = new SerialPortDriver(serialPort)
    transceiver = new TransceiverClass(driver) // TODO: devices with second parameter (i.e. ICOM) - needs to build (rudimentary) way to build enquirer prompts from device's json schema

    log(c.blue(`Opening ${c.bold(TransceiverClass.displayName)} for writing at ${c.bold(serialPort.path)} with baud rate = ${c.bold(serialPort.baudRate.toString())} ...`))
    await transceiver.open()
    log(c.green("Done! ✅"))
  }, LONG_TIMEOUT)

  afterAll(async () => {
    await transceiver.close()
  })

  test("set/read vfo", async () => {
    const previousCurrentFrequency = await transceiver.getVFOFrequency({ vfo: VFOType.Current })
    log(`Read previous current VFO frequency: ${previousCurrentFrequency}`)

    const validateParameter = new Ajv().compile(transceiver.getCommandSchema("setVFOFrequency"))
    const testFrequencies = TEST_FREQUENCIES.filter((frequency) => validateParameter({ vfo: VFOType.Current, frequency }))

    try {
      for (const testFrequency of testFrequencies) {
        log(c.blue(`Setting current VFO frequency to ${c.bold(testFrequency.toString())}`))

        await transceiver.setVFOFrequency({ vfo: VFOType.Current, frequency: testFrequency })

        await expect(transceiver.getVFOFrequency({ vfo: VFOType.Current })).resolves.toEqual(testFrequency)
        log(c.green(`Read back ${c.bold(testFrequency.toString())}`))
      }
    } finally {
      await transceiver.setVFOFrequency({ vfo: VFOType.Current, frequency: previousCurrentFrequency })
    }
  }, LONG_TIMEOUT) // 10 minutes timeout
})
