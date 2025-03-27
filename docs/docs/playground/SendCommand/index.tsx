import { IChangeEvent } from '@rjsf/core'
import Admonition from "@theme/Admonition"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import validator from '@rjsf/validator-ajv8'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import clsx from 'clsx'
import { DeviceLog } from './DeviceLog'
import { Device } from "@ham-js/cat"
import { DriverLog } from './DriverLog'
import { Form } from '../Form'

interface Props {
  device: Device | null
}

export const SendCommand = ({ device }: Props) => {
  const commands = useMemo(() => device?.getCommands() || [], [device])
  const [selectedCommand, setSelectedCommand] = useState(commands[0])
  const commandSchema = useMemo(() => device && selectedCommand ? device.getCommandSchema(selectedCommand) : {}, [device, selectedCommand])

  const handleSelectedCommandChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => setSelectedCommand(value), [])

  const handleSendCommand = useCallback(({ formData: commandParameter }: IChangeEvent) => {
    const sendCommand = async () => {
      if (!device) return
      if (!(commands.includes(selectedCommand))) return

      await device[selectedCommand](commandParameter)
    }

    sendCommand()
  }, [commands, selectedCommand, device])

  useEffect(() => {
    setSelectedCommand(commands[0])
  }, [commands])

  return <>
    {!device && <Admonition type="info">You need to connect first</Admonition>}

    <div><label htmlFor="selectedCommand">Command</label></div>

    <select className="margin-bottom--md" disabled={!device} onChange={handleSelectedCommandChange} value={selectedCommand}>
      {commands.map((commandKey) => <option key={commandKey} value={commandKey}>{commandKey}</option>)}
    </select>

    <h3>Parameters</h3>

    <div className="margin-bottom--md">
      <Form
        onSubmit={handleSendCommand}
        schema={commandSchema}
        validator={validator}
      >
        <div className="margin-bottom--md"><button className="button button--primary" disabled={!device} type="submit">Send Command</button></div>
      </Form>
    </div>

    <Tabs>
      <TabItem label="Device Log" value="deviceLog">
        <DeviceLog device={device} />
      </TabItem>
      <TabItem label="Driver Log" value="driverLog">
        <DriverLog device={device} />
      </TabItem>
    </Tabs>
  </>
}
