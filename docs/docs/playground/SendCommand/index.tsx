import Form, { IChangeEvent } from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import { ChangeEvent, useCallback, useMemo, useState } from "react"
import { DeviceDriverCommandParameterType } from "../../../../src/device-drivers/base/DeviceCommandParameterType"
import { TransceiverDriver } from "../../../../src/device-drivers/transceivers/base/TransceiverDriver"
import Styles from "./bootstrap.module.scss"
import clsx from 'clsx'
import { Output } from './Output'

interface Props {
  deviceDriver: TransceiverDriver
}

export const SendCommand = ({ deviceDriver }: Props) => {
  const commandKeys = useMemo(() => deviceDriver.getCommandKeys(), [deviceDriver])
  const [output, setOutput] = useState<Output[]>([])
  const [selectedCommandKey, setSelectedCommandKey] = useState(commandKeys[0])
  const commandSchema = useMemo(() => deviceDriver.getCommandSchema(selectedCommandKey), [deviceDriver, selectedCommandKey])

  const handleSelectedCommandKeyChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => setSelectedCommandKey(value as typeof selectedCommandKey), [])

  const handleSendCommand = useCallback(({ formData: commandParameter }: IChangeEvent<DeviceDriverCommandParameterType<typeof deviceDriver, typeof selectedCommandKey>>) => {
    const sendCommand = async () => {
      if (!deviceDriver.implementsCommand(selectedCommandKey)) return

      const result = await deviceDriver.sendCommand(selectedCommandKey, commandParameter)
      setOutput([
        ...output,
        {
          commandKey: selectedCommandKey,
          parameters: JSON.stringify(commandParameter),
          result: JSON.stringify(result)
        }
      ])
    }

    sendCommand()
  }, [deviceDriver, output, selectedCommandKey])

  return <>
    <h2>Commands</h2>

    <div><label htmlFor="selectedCommandKey">Command</label></div>

    <select className="margin-bottom--md" onChange={handleSelectedCommandKeyChange} value={selectedCommandKey}>
      {commandKeys.map((commandKey) => <option key={commandKey} value={commandKey}>{commandKey}</option>)}
    </select>

    <h3>Parameters</h3>

    <div className={clsx("margin-bottom--md", Styles.bootstrap)}>
      <Form<DeviceDriverCommandParameterType<typeof deviceDriver, typeof selectedCommandKey>>
        onSubmit={handleSendCommand}
        schema={commandSchema}
        validator={validator}
      >
        <div className="margin-bottom--md"><button className="button button--primary" type="submit">Send Command</button></div>
      </Form>
    </div>

    <Output output={output} />
  </>
}
