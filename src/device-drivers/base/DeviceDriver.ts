import { DeviceType } from "./DeviceType"
import { Command } from "./Command"
import zodToJsonSchema from "zod-to-json-schema"
import { DeviceVendor } from "./DeviceVendor"
import { CommunicationDriver } from "../../communication-drivers/base/CommunicationDriver"
import { Mutex } from "async-mutex"
import { JSONSchema7 } from "json-schema"
import { LogDriver } from "../../communication-drivers/LogDriver"
import { NotInstantiable } from "../../utils/types/NotInstantiable"

interface DeviceWithCommand<C extends object, K extends keyof C> {
  _commands: Required<{[k in K]: C[K]}>
}

/**
 * This is the base device for all classes which can create command strings.
 * Usually an abstract subclass is created for each type of device, such as
 * `TransceiverDevice` to define the deviceType or deviceVendor, but also common
 * command factories for all instances of that device.
 * @property {string} deviceName The name of the actual device
 * @property {DeviceType} deviceType The type of the device
 * @property {DeviceVendor} deviceVendor The vendor of the device. Will be extended when new devices of different kinds are added.
 * @property {object} _commandFactories Subclasses use this property to implement command factories. Do not access this directly, use `buildCommand` instead.
 */

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export abstract class DeviceDriver<C extends {[k: string]: Command<any, any>}> {
  static readonly deviceName: string
  static readonly deviceType: DeviceType
  static readonly deviceVendor: DeviceVendor
  static readonly supportedCommunicationDrivers: NotInstantiable<typeof CommunicationDriver>[] = []

  /** @protected */
  abstract readonly _commands: C // we can't make this private or protected because then we can't use this in type params which are public

  private mutex = new Mutex()

  public get log(): LogDriver["log"] | undefined {
    return this.communicationDriver instanceof LogDriver ? this.communicationDriver.log : undefined
  }

  constructor(protected communicationDriver: CommunicationDriver) {
    if (!this.isSupportedCommunicationDriver()) throw new Error("This communication driver is not supported by this device driver")
  }

  protected isSupportedCommunicationDriver(): boolean {
    return (this.constructor as typeof DeviceDriver<never>).supportedCommunicationDrivers.some((driver) =>
      // typescript needs to be convinced here that instanceof can be called on a
      // class which has a constructor that is not callable, but still has a
      // prototype property (which is how instanceof works)
      this.communicationDriver instanceof (driver as typeof CommunicationDriver))
  }

  get isOpen(): boolean {
    return this.communicationDriver.isOpen
  }

  async open({ log }: { log: boolean } = { log: false }): Promise<void> {
    if (log) this.startLogging()

    await this.communicationDriver.open?.()
  }

  async close(): Promise<void> {
    await this.communicationDriver.close?.()
  }

  protected startLogging() {
    if (this.log) return

    this.communicationDriver = new LogDriver(this.communicationDriver)
  }

  protected stopLogging() {
    if (this.communicationDriver instanceof LogDriver) {
      this.communicationDriver.stopLogging()
      this.communicationDriver = this.communicationDriver.driver
    }
  }

  /**
   * This method allows you to build command strings.
   * @param {string} key The key of a command this device implements. You cannot build
   * command strings for optional commands. Use `device.implementsOptionalCommand('aCommand')`
   * as a type guard in these cases.
   * @param {object} parameter The parameters this command expects. Will be validated against
   * the schema of that command and might throw an error if invalid parameters
   * are handed in. Some types can be checked at build time, e.g. that a
   * frequency is a `number`. However a frequency might be restricted to a
   * certain range and that is validated at runtime. You can get the schema of a
   * command by using `getCommandSchema`.
   * @returns {string} a CAT command in the form of a string
   * @example ```typescript
   * const device: TransceiverDevice = // ...
   * device.buildCommand('setVFO', { frequency: 14_250_000, vfo: 0 }) // => "FA14250000;"
   * device.buildCommand('setVFO', { frequency: -120, vfo: 0 }) // => Will throw an error at runtime, as -120 is a number and TypeScript is happy
   * device.buildCommand('setAGC', { level: AGCLevel.Off }) // => won't compile as 'setAGC' is an optional command and this device might not implement it
   * if (device.hasCommand('setAGC')) device.buildCommand('setAGC', { level: AGCLevel.Off }) // => "GC00;"
   * ```
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  async sendCommand<K extends keyof C>(key: K, parameter: this['_commands'][typeof key] extends Command<infer P, any> ? P : never): Promise<this['_commands'][typeof key] extends Command<any, infer R> ? ReturnType<Command<any, R>> extends Promise<infer T> ? T : R : never> {
    if (!this.isOpen) throw new Error("Communication driver is not open for sending commands (did you forget to call `await driver.open()`?")

    const release = await this.mutex.acquire()

    try {
      const command = this._commands[key]

      return command(command.parameterType.parse(parameter))
    } finally {
      release()
    }
  }

  /**
   * This method returns whether this device implements an optional command factory for a given
   * string. **It ALSO acts as a type guard, so TypeScript knows a command factory with
   * the given key exists.**
   * @param {string} key The key of a command this device might implement.
   * @returns {boolean} whether this device implements that command
   * @example ```typescript
   * const device: TransceiverDevice = // ...
   * if (device.implementsOptionalCommandFactory('setAGC')) {} // the type of the device changed here, so that 'setAGC' is not optional anymore and we can e.g. call buildCommand
   * ```
   */
  implementsCommand<K extends keyof C>(key: K): this is DeviceWithCommand<this['_commands'], K> {
    return !!this._commands[key]
  }

  /**
   * This method allows you to get the JSON schema for a device.
   * @param {string} key A key that is guaranteed to be in the schema. You won't be able
   * to call this method for optional commands. In that case use `implementsOptionalCommand` as
   * a type guard.
   * @returns {object} a json schema for the command that you can use to validate user input or to build forms for devices
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  getCommandSchema<K extends keyof C>(key: this['_commands'][K] extends Command<any, any> ? K : never): JSONSchema7 {
    return zodToJsonSchema(this._commands[key].parameterType) as JSONSchema7 // https://github.com/StefanTerdell/zod-to-json-schema/issues/144
  }

  /**
   * @returns {string[]} The command keys this class implements
   */
  getCommandKeys(): (keyof C)[] {
    return Object.keys(this._commands)
  }
}
