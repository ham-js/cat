import Form, { IChangeEvent } from '@rjsf/core'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import validator from '@rjsf/validator-ajv8'
import { ChangeEvent, useCallback, useMemo, useState } from "react"
import { DeviceDriverCommandParameterType } from "../../../../src/device-drivers/base/DeviceCommandParameterType"
import { TransceiverDriver } from "../../../../src/device-drivers/transceivers/base/TransceiverDriver"
import Styles from "./bootstrap.module.scss"
import clsx from 'clsx'
import { CommandLogOutput, CommandLog } from './CommandLogOutput'
import { CommunicationLogOutput } from './CommunicationLogOutput'

interface Props {
  deviceDriver: TransceiverDriver
}

export const SendCommand = ({ deviceDriver }: Props) => {
  const commandKeys = useMemo(() => deviceDriver.getCommandKeys(), [deviceDriver])
  const [commandLog, setCommandLog] = useState<CommandLog[]>([])
  const [selectedCommandKey, setSelectedCommandKey] = useState(commandKeys[0])
  const commandSchema = useMemo(() => deviceDriver.getCommandSchema(selectedCommandKey), [deviceDriver, selectedCommandKey])

  const handleSelectedCommandKeyChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => setSelectedCommandKey(value as typeof selectedCommandKey), [])

  const handleSendCommand = useCallback(({ formData: commandParameter }: IChangeEvent<DeviceDriverCommandParameterType<typeof deviceDriver, typeof selectedCommandKey>>) => {
    const sendCommand = async () => {
      if (!deviceDriver.implementsCommand(selectedCommandKey)) return

      const result = await deviceDriver.sendCommand(selectedCommandKey, commandParameter)
      setCommandLog([
        ...commandLog,
        {
          commandKey: selectedCommandKey,
          parameters: JSON.stringify(commandParameter),
          result: JSON.stringify(result),
          timestamp: new Date()
        }
      ])
    }

    sendCommand()
  }, [deviceDriver, commandLog, selectedCommandKey])

  return <>
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

    <Tabs>
      <TabItem label="Command Log" value="commandLog">
        <CommandLogOutput commandLog={commandLog} />
      </TabItem>
      <TabItem label="Communication Log" value="communicationLog">
        <CommunicationLogOutput deviceDriver={deviceDriver} />
      </TabItem>
    </Tabs>
  </>
}
