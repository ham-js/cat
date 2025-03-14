import { DeviceType } from "../enums/DeviceType"
import { TransceiverDeviceVendor } from "../../transceivers/base/types/TransceiverDeviceVendor"
import { CommandFactory } from "./CommandFactory"
import zodToJsonSchema from "zod-to-json-schema"

interface DeviceWithCommand<C extends object, K extends keyof C> {
  _commandFactories: Required<{[k in K]: C[K]}>
}

/**
 * This is the base device for all classes which can create command strings.
 * Usually an abstract subclass is created for each type of device, such as
 * `TransceiverDevice` to define the deviceType or deviceVendor, but also common
 * command factories for all instances of that device.
 * @property {string} deviceName The name of the actual device
 * @property {DeviceType} deviceType The type of the device
 * @property {TransceiverDeviceVendor} deviceVendor The vendor of the device. Will be extended when new devices of different kinds are added.
 * @property {object} _commandFactories Subclasses use this property to implement command factories. Do not access this directly, use `buildCommand` instead.
 */

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export abstract class Device<C extends {[k: string]: CommandFactory<any>}> {
  static readonly deviceName: string
  static readonly deviceType: DeviceType
  static readonly deviceVendor: TransceiverDeviceVendor

  /** @protected */
  abstract readonly _commandFactories: C // we can't make this private or protected because then we can't use this in type params which are public

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
  buildCommand<K extends keyof C>(key: K, parameter: this['_commandFactories'][typeof key] extends CommandFactory<infer P> ? P : never): string {
    const commandFactory = this._commandFactories[key]

    return commandFactory(commandFactory.parameterType.parse(parameter))
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
  implementsOptionalCommandFactory<K extends keyof C>(key: K): this is DeviceWithCommand<this['_commandFactories'], K> {
    return !!this._commandFactories[key]
  }

  /**
   * This method allows you to get the JSON schema for a device.   * 
   * @param {string} key A key that is guaranteed to be in the schema. You won't be able
   * to call this method for optional commands. In that case use `implementsOptionalCommand` as
   * a type guard.
   * @returns {object} a json schema for the command that you can use to validate user input or to build forms for devices
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  getCommandFactorySchema<K extends keyof C>(key: this['_commandFactories'][K] extends CommandFactory<any> ? K : never): ReturnType<typeof zodToJsonSchema> {
    return zodToJsonSchema(this._commandFactories[key].parameterType)
  }
}
