import { DeviceType } from "../enums/DeviceType"
import { TransceiverDeviceVendor } from "../../transceivers/base/types/TransceiverDeviceVendor"
import { CommandFactory } from "./CommandFactory"
import zodToJsonSchema from "zod-to-json-schema"

interface DeviceWithCommand<C extends object, K extends keyof C> {
  commands: Required<{[k in K]: C[K]}>
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

// const test: CommandFactory<{ p: string }> = () => "test"
// test.parameterType = z.object({
//   p: z.string()
// })

// abstract class SuperDevice extends Device {
//   static deviceName = "test"
//   static deviceType = DeviceType.Transceiver
//   static deviceVendor = TransceiverDeviceVendor.Yaesu

//   abstract commands: {
//     test: CommandFactory<{ p: string }>
//     abc?: CommandFactory<{ no: string }>
//     def?: CommandFactory<{ no: string }>
//   }
// }

// class SomeDevice extends SuperDevice {
//   commands = {
//     test
//   }
// }

// const someDevice: SuperDevice = new SomeDevice()
// someDevice.buildCommand('test', {p: "2"}) // should work
// someDevice.buildCommand('test', {p: 2}) // shouldn't work (wrong p)
// someDevice.buildCommand('abc', {no: "1"}) // shouldn't work - abc optional
// someDevice.buildCommand('def', {no: "1"}) // shouldn't work - def optional
// if (someDevice.hasCommand('abc')) someDevice.buildCommand('test', {p: "1"}) // should work - test is always safe
// if (someDevice.hasCommand('abc')) someDevice.buildCommand('abc', {no: "1"}) // should work - abc is no guaranteed to be there
// if (someDevice.hasCommand('abc')) someDevice.buildCommand('def', {no: "1"}) // shouldn't work - def is still not guaranteed
// if (someDevice.hasCommand('something')) someDevice.buildCommand('something', 'never') // shouldn't work - something is not a command anytime

// someDevice.getCommandSchema('def') // shouldn't work
// someDevice.getCommandSchema('abc') // shouldn't work
// if (someDevice.hasCommand('abc')) someDevice.getCommandSchema('abc') // should work
// if (someDevice.hasCommand('abc')) someDevice.getCommandSchema('def') // shouldn't work
// if (someDevice.hasCommand('abc')) someDevice.getCommandSchema('test') // should work
// someDevice.getCommandSchema('something') // shouldn't work
