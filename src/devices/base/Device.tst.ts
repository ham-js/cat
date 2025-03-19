import { describe, expect, test } from 'tstyche'
import { Command } from './Command'
import { z } from 'zod'
import { Device } from './Device'
import { DeviceType } from './DeviceType'
import { TransceiverDeviceVendor } from '../transceivers/base/TransceiverDeviceVendor'

type NotImplementedCommand = CommandFactory<{ notImplemented: never }>
type TestCommand<T extends string = string> = CommandFactory<{ param: T }>

type TestCommandFactories = {
  command: TestCommand
  optionalImplementedCommand?: TestCommand<'optional'>
  notImplementedCommand?: NotImplementedCommand
}

abstract class TestTransceiverDevice extends Device<TestCommandFactories> {
  static deviceName = "test"
  static deviceType = DeviceType.Transceiver
  static deviceVendor = TransceiverDeviceVendor.Yaesu
}

const commandParameterType  = z.object({
  param: z.string()
})
const command: CommandFactory<z.infer<typeof commandParameterType>> = () => "test"
command.parameterType = commandParameterType

const optionalImplementedCommandParameterType  = z.object({
  param: z.enum(["optional"])
})
const optionalImplementedCommand: CommandFactory<z.infer<typeof optionalImplementedCommandParameterType>> = () => "test"
optionalImplementedCommand.parameterType = optionalImplementedCommandParameterType

class TestDevice extends TestTransceiverDevice {
  _commandFactories = {
    command,
    optionalImplementedCommand
  }
}

describe("Device", () => {
  const testDevice = new TestDevice()
  const testTransceiverDevice: TestTransceiverDevice = testDevice

  test("allows to query for commands and then build them or get schema", () => {
    // the most specific device knows out of the box what it implements
    expect<typeof testDevice['_commandFactories']['command']>().type.toBe<TestCommand>()
    expect<typeof testDevice['_commandFactories']['optionalImplementedCommand']>().type.toBe<typeof optionalImplementedCommand>()
    expect<Parameters<typeof testDevice.buildCommand<'command'>>[1]>().type.toBe<{ param: string }>()
    expect<Parameters<typeof testDevice.buildCommand<'optionalImplementedCommand'>>[1]>().type.toBe<{ param: 'optional' }>()
    expect<Parameters<typeof testDevice.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()
    expect<Parameters<typeof testDevice.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<'optionalImplementedCommand'>()

    // in the more abstract device some commands are optional, so we can't build them or get their schema out of the box
    expect<typeof testTransceiverDevice['_commandFactories']['command']>().type.toBe<TestCommand>()
    expect<typeof testTransceiverDevice['_commandFactories']['optionalImplementedCommand']>().type.toBe<TestCommand<'optional'> | undefined>()
    expect<Parameters<typeof testTransceiverDevice.buildCommand<'command'>>[1]>().type.toBe<{ param: string }>()
    expect<Parameters<typeof testTransceiverDevice.buildCommand<'notImplementedCommand'>>[1]>().type.toBe<never>()
    expect<Parameters<typeof testTransceiverDevice.buildCommand<'optionalImplementedCommand'>>[1]>().type.toBe<never>()
    expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()
    expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'notImplementedCommand'>>[0]>().type.toBe<never>()
    expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<never>()

    // we already know this - command is not optional
    if (testTransceiverDevice.implementsOptionalCommand('command')) {
      expect<typeof testTransceiverDevice['_commandFactories']['command']>().type.toBe<TestCommand>()
      expect<Parameters<typeof testTransceiverDevice.buildCommand<'command'>>[1]>().type.toBe<{ param: string }>()
      expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()

      // this didn't change the other commands
      expect<typeof testTransceiverDevice['_commandFactories']['optionalImplementedCommand']>().type.toBe<TestCommand<'optional'> | undefined>()
      expect<typeof testTransceiverDevice['_commandFactories']['notImplementedCommand']>().type.toBe<NotImplementedCommand | undefined>()
      expect<Parameters<typeof testTransceiverDevice.buildCommand<'notImplementedCommand'>>[1]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDevice.buildCommand<'optionalImplementedCommand'>>[1]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'notImplementedCommand'>>[0]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<never>()
    }

    // now we check the type guard for the optional command
    if (testTransceiverDevice.implementsOptionalCommand('optionalImplementedCommand')) {
      expect<typeof testTransceiverDevice['_commandFactories']['optionalImplementedCommand']>().type.toBe<TestCommand<'optional'>>()
      expect<Parameters<typeof testTransceiverDevice.buildCommand<'optionalImplementedCommand'>>[1]>().type.toBe<{ param: 'optional' }>()
      expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<'optionalImplementedCommand'>()

      // this didn't change the other commands
      expect<typeof testTransceiverDevice['_commandFactories']['notImplementedCommand']>().type.toBe<NotImplementedCommand | undefined>()
      expect<typeof testTransceiverDevice['_commandFactories']['command']>().type.toBe<TestCommand>()
      expect<Parameters<typeof testTransceiverDevice.buildCommand<'command'>>[1]>().type.toBe<{ param: string }>()
      expect<Parameters<typeof testTransceiverDevice.buildCommand<'notImplementedCommand'>>[1]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()
      expect<Parameters<typeof testTransceiverDevice.getCommandSchema<'notImplementedCommand'>>[0]>().type.toBe<never>()
    }
  })
})
