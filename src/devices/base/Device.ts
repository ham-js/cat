import { Mutex } from "async-mutex"
import { JSONSchema7 } from "json-schema"

import { DeviceType } from "devices/base/DeviceType"
import { DeviceVendor } from "devices/base/DeviceVendor"
import { Driver } from "drivers/base/Driver"
import { LogDriver } from "drivers/LogDriver"

export abstract class Device {
  static readonly deviceName: string
  static readonly deviceType: DeviceType
  static readonly deviceVendor: DeviceVendor

  private mutex = new Mutex()
  private commandSchemas = new Map<string, JSONSchema7>()

  public get log(): LogDriver["log"] | undefined {
    return this.driver instanceof LogDriver ? this.driver.log : undefined
  }

  constructor(protected driver: Driver) {
    // if (!this.isSupportedCommunicationDriver()) throw new Error("This communication driver is not supported by this device driver")
  }

  // protected isSupportedCommunicationDriver(): boolean {
    // return (this.constructor as typeof DeviceDriver).supportedCommunicationDrivers.some((driver) =>
    //   // typescript needs to be convinced here that instanceof can be called on a
    //   // class which has a constructor that is not callable, but still has a
    //   // prototype property (which is how instanceof works)
    //   this.driver instanceof (driver as typeof CommunicationDriver))
  // }

  get isOpen(): boolean {
    return this.driver.isOpen
  }

  async open({ log }: { log: boolean } = { log: false }): Promise<void> {
    if (log) this.startLogging()

    await this.driver.open?.()
  }

  async close(): Promise<void> {
    await this.driver.close?.()
  }

  protected startLogging() {
    if (this.log) return

    this.driver = new LogDriver(this.driver)
  }

  protected stopLogging() {
    if (this.driver instanceof LogDriver) {
      this.driver.stopLogging()
      this.driver = this.driver.driver
    }
  }

  displayName(): string {
    return "hihi"
  }

  getCommandSchema(command: string): JSONSchema7 {
    if (!(command in this)) throw new Error(`The command \`${command}\` does not exist on this device`)

    const commandSchema = this.commandSchemas.get(command)

    if (!commandSchema) throw new Error(`Couldn't find a command parameter schema for the command \`${command}\`. Did you forget to declare the command using the @command({}) decorator?`)

    return commandSchema
  }

  getCommands(): string[] {
    return [...this.commandSchemas.keys()]
  }
}
