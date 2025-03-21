import { describe, expect, test } from 'tstyche'
import { Command } from './Command'
import { z } from 'zod'
import { DeviceDriver } from './DeviceDriver'
import { DeviceType } from './DeviceType'
import { TransceiverVendor } from '../transceivers/base/TransceiverVendor'

type NotImplementedCommand = Command<{ notImplemented: never }, never>
type TestCommand<T extends string = string, R extends number = number> = Command<{ param: T }, R>

type TestCommands = {
  command: TestCommand
  optionalImplementedCommand?: TestCommand<'optional'>
  notImplementedCommand?: NotImplementedCommand
}

abstract class TestTransceiverDeviceDriver extends DeviceDriver<TestCommands> {
  static deviceName = "test"
  static deviceType = DeviceType.Transceiver
  static deviceVendor = TransceiverVendor.Yaesu
}

const commandParameterType  = z.object({
  param: z.string()
})
const command: Command<z.infer<typeof commandParameterType>, number> = () => 123
command.parameterType = commandParameterType

const optionalImplementedCommandParameterType  = z.object({
  param: z.enum(["optional"])
})
const optionalImplementedCommand: Command<z.infer<typeof optionalImplementedCommandParameterType>, number> = () => 456
optionalImplementedCommand.parameterType = optionalImplementedCommandParameterType

class TestDeviceDriver extends TestTransceiverDeviceDriver {
  _commands = {
    command,
    optionalImplementedCommand
  }
}

describe("Device", () => {
  const testDeviceDriver = new TestDeviceDriver(null as any)
  const testTransceiverDeviceDriver: TestTransceiverDeviceDriver = testDeviceDriver

  test("allows to query for commands and then build them or get schema", () => {
    // the most specific device knows out of the box what it implements
    expect<typeof testDeviceDriver['_commands']['command']>().type.toBe<TestCommand>()
    expect<typeof testDeviceDriver['_commands']['optionalImplementedCommand']>().type.toBe<typeof optionalImplementedCommand>()
    expect<Parameters<typeof testDeviceDriver.sendCommand<'command'>>[1]>().type.toBe<{ param: string }>()
    expect<Parameters<typeof testDeviceDriver.sendCommand<'optionalImplementedCommand'>>[1]>().type.toBe<{ param: 'optional' }>()
    expect<Parameters<typeof testDeviceDriver.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()
    expect<Parameters<typeof testDeviceDriver.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<'optionalImplementedCommand'>()

    // in the more abstract device some commands are optional, so we can't build them or get their schema out of the box
    expect<typeof testTransceiverDeviceDriver['_commands']['command']>().type.toBe<TestCommand>()
    expect<typeof testTransceiverDeviceDriver['_commands']['optionalImplementedCommand']>().type.toBe<TestCommand<'optional'> | undefined>()
    expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'command'>>[1]>().type.toBe<{ param: string }>()
    expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'notImplementedCommand'>>[1]>().type.toBe<never>()
    expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'optionalImplementedCommand'>>[1]>().type.toBe<never>()
    expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()
    expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'notImplementedCommand'>>[0]>().type.toBe<never>()
    expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<never>()

    // we already know this - command is not optional
    if (testTransceiverDeviceDriver.implementsCommand('command')) {
      expect<typeof testTransceiverDeviceDriver['_commands']['command']>().type.toBe<TestCommand>()
      expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'command'>>[1]>().type.toBe<{ param: string }>()
      expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()

      // this didn't change the other commands
      expect<typeof testTransceiverDeviceDriver['_commands']['optionalImplementedCommand']>().type.toBe<TestCommand<'optional'> | undefined>()
      expect<typeof testTransceiverDeviceDriver['_commands']['notImplementedCommand']>().type.toBe<NotImplementedCommand | undefined>()
      expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'notImplementedCommand'>>[1]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'optionalImplementedCommand'>>[1]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'notImplementedCommand'>>[0]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<never>()
    }

    // now we check the type guard for the optional command
    if (testTransceiverDeviceDriver.implementsCommand('optionalImplementedCommand')) {
      expect<typeof testTransceiverDeviceDriver['_commands']['optionalImplementedCommand']>().type.toBe<TestCommand<'optional'>>()
      expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'optionalImplementedCommand'>>[1]>().type.toBe<{ param: 'optional' }>()
      expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'optionalImplementedCommand'>>[0]>().type.toBe<'optionalImplementedCommand'>()

      // this didn't change the other commands
      expect<typeof testTransceiverDeviceDriver['_commands']['notImplementedCommand']>().type.toBe<NotImplementedCommand | undefined>()
      expect<typeof testTransceiverDeviceDriver['_commands']['command']>().type.toBe<TestCommand>()
      expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'command'>>[1]>().type.toBe<{ param: string }>()
      expect<Parameters<typeof testTransceiverDeviceDriver.sendCommand<'notImplementedCommand'>>[1]>().type.toBe<never>()
      expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'command'>>[0]>().type.toBe<'command'>()
      expect<Parameters<typeof testTransceiverDeviceDriver.getCommandSchema<'notImplementedCommand'>>[0]>().type.toBe<never>()
    }
  })
})
