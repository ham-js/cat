import Form, { IChangeEvent } from '@rjsf/core'
import Admonition from "@theme/Admonition"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import validator from '@rjsf/validator-ajv8'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { DeviceDriverCommandParameterType } from "../../../../src/device-drivers/base/DeviceCommandParameterType"
import { TransceiverDriver } from "../../../../src/device-drivers/transceivers/base/TransceiverDriver"
import Styles from "./bootstrap.module.scss"
import clsx from 'clsx'
import { CommandLogOutput, CommandLog } from './CommandLogOutput'
import { CommunicationLogOutput } from './CommunicationLogOutput'
import { TransceiverVFOType } from '../../../../src/device-drivers/transceivers/base/TransceiverVFOType'

interface Props {
  deviceDriver: TransceiverDriver | null
}

export const SendCommand = ({ deviceDriver }: Props) => {
  const commandKeys = useMemo(() => deviceDriver?.getCommandKeys() || [], [deviceDriver])
  const [commandLog, setCommandLog] = useState<CommandLog[]>([])
  const [selectedCommandKey, setSelectedCommandKey] = useState(commandKeys[0])
  const commandSchema = useMemo(() => deviceDriver && selectedCommandKey ? deviceDriver.getCommandSchema(selectedCommandKey) : {}, [deviceDriver, selectedCommandKey])

  useEffect(() => {
    if (deviceDriver) setCommandLog([])
  }, [deviceDriver])

  const handleSelectedCommandKeyChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => setSelectedCommandKey(value as typeof selectedCommandKey), [])

  const handleSendCommand = useCallback(({ formData: commandParameter }: IChangeEvent<DeviceDriverCommandParameterType<typeof deviceDriver, typeof selectedCommandKey>>) => {
    const sendCommand = async () => {
      if (!deviceDriver) return
      if (!deviceDriver.implementsCommand(selectedCommandKey)) return

      try {
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
      } catch (error) {
        setCommandLog([
          ...commandLog,
          {
            commandKey: selectedCommandKey,
            parameters: JSON.stringify(commandParameter),
            error: error.message,
            timestamp: new Date()
          }
        ])
      }
    }

    sendCommand()
  }, [deviceDriver, commandLog, selectedCommandKey])

  useEffect(() => {
    setSelectedCommandKey(commandKeys[0])
  }, [commandKeys])

  const handleClearCommandLog = useCallback(() => setCommandLog([]), [])

  return <>
    {!deviceDriver && <Admonition type="info">You need to connect to a driver first</Admonition>}

    <div><label htmlFor="selectedCommandKey">Command</label></div>

    <select className="margin-bottom--md" disabled={!deviceDriver} onChange={handleSelectedCommandKeyChange} value={selectedCommandKey}>
      {commandKeys.map((commandKey) => <option key={commandKey} value={commandKey}>{commandKey}</option>)}
    </select>

    <h3>Parameters</h3>

    <div className={clsx("margin-bottom--md", Styles.bootstrap)}>
      <Form<DeviceDriverCommandParameterType<typeof deviceDriver, typeof selectedCommandKey>>
        onSubmit={handleSendCommand}
        schema={commandSchema}
        validator={validator}
      >
        <div className="margin-bottom--md"><button className="button button--primary" disabled={!deviceDriver} type="submit">Send Command</button></div>
      </Form>
    </div>

    <Tabs>
      <TabItem label="Command Log" value="commandLog">
        <CommandLogOutput commandLog={commandLog} onClear={handleClearCommandLog} />
      </TabItem>
      <TabItem label="Communication Log" value="communicationLog">
        <CommunicationLogOutput deviceDriver={deviceDriver} />
      </TabItem>
    </Tabs>
  </>
}
