import { DeviceType } from "../enums/DeviceType"
import { TransceiverDeviceVendor } from "../../transceivers/base/types/TransceiverDeviceVendor"
import { CommandFactory } from "./CommandFactory"
import zodToJsonSchema from "zod-to-json-schema"

interface DeviceWithCommand<C extends object, K extends keyof C> {
  _commands: Required<{[k in K]: C[K]}>
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export abstract class Device<C extends {[k: string]: CommandFactory<any>} = {[k: string]: CommandFactory<any>}> {
  static readonly deviceName: string // the name of the device
  static readonly deviceType: DeviceType // the type of the device
  static readonly deviceVendor: TransceiverDeviceVendor // the name of the vendor

  abstract readonly _commands: C

  buildCommand<K extends keyof C>(key: K, param: this['_commands'][typeof key] extends CommandFactory<infer P> ? P : never): string {
    return this._commands[key](param)
  }

  hasCommand<K extends string>(key: K): this is DeviceWithCommand<this['_commands'], K> {
    return !!this._commands[key]
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  getCommandSchema<K extends keyof C>(key: this['_commands'][K] extends CommandFactory<any> ? K : never): ReturnType<typeof zodToJsonSchema> {
    return zodToJsonSchema(this._commands[key].parameterType)
  }
}
