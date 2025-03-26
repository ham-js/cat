import Form, { IChangeEvent } from "@rjsf/core"
import { customizeValidator } from '@rjsf/validator-ajv8'
import { Device, Devices } from "@ham-js/cat"
import { ChangeEvent, useCallback, useMemo, useState } from "react"
import { ChooseDriver, DriverFactory } from "./ChooseDriver"
import BootstrapStyles from "../bootstrap.module.scss"

const getDeviceKey = ({ deviceType, deviceName, deviceVendor }: typeof Device): string => deviceType + deviceVendor + deviceName

interface Props {
  onChange: (device: Device | null) => void
  device: Device | null
}

export const ConnectDevice = ({ device, onChange }: Props) => {
  const [driverFactory, setDriverFactory] = useState<DriverFactory>(() => () => undefined)
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0)
  const DeviceConstructor = useMemo(() => Devices[selectedDeviceIndex], [selectedDeviceIndex])
  const [connecting, setConnecting] = useState(false)
  const deviceSchema = useMemo(() => DeviceConstructor?.deviceSchema ?? {}, [DeviceConstructor])

  const validator = useMemo(() => customizeValidator<ConstructorParameters<typeof DeviceConstructor>[1]>(), [])

  const handleConnect = useCallback(({ formData: deviceParameter }: IChangeEvent<ConstructorParameters<typeof DeviceConstructor>[1]>) => {
    const connect = async () => {
      setConnecting(true)

      try {
        const driver = await driverFactory()
        if (!driver) return

        const device = new DeviceConstructor(driver, deviceParameter)
        await device.open({ log: true })

        onChange(device)

      } finally {
        setConnecting(false)
      }
    }

    connect()
  }, [DeviceConstructor, driverFactory, onChange])

  const handleDisconnect = useCallback(() => {
    const disconnect = async () => {
      await device?.close()

      onChange(null)
    }

    disconnect()
  }, [device, onChange])

  const handleSelectedDeviceIndexChange = useCallback(({ target: { value } }: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceIndex(parseInt(value, 10))
  }, [])

  const handleDriverFactoryChange = useCallback((newDriverFactory: DriverFactory) => setDriverFactory(() => newDriverFactory), [])

  return <>
    <div><label htmlFor="device">Device</label></div>

    <select className="margin-bottom--md" disabled={device?.isOpen} id="device" onChange={handleSelectedDeviceIndexChange} value={selectedDeviceIndex}>
      {
        Devices.map((DeviceConstructor, i) =>
          <option key={getDeviceKey(DeviceConstructor)} value={i}>
            {DeviceConstructor.deviceVendor} {DeviceConstructor.deviceName}
          </option>
        )
      }
    </select>

    <div className={BootstrapStyles.bootstrap}>
      <Form<ConstructorParameters<typeof DeviceConstructor>[1]>
        onSubmit={handleConnect}
        schema={deviceSchema}
        validator={validator}
      >
        <div className="margin-vert--md"><ChooseDriver disabled={!!device} driverTypes={DeviceConstructor.supportedDrivers} onDriverFactoryChange={handleDriverFactoryChange} /></div>
        {!device && <div><button className="button button--primary margin-right--md" disabled={connecting} type="submit">Connect</button></div>}
      </Form>

    </div>
    {
      !!device && <>
        <button className="button button--primary margin-right--md" disabled={connecting} onClick={handleDisconnect} type="button">Disconnect</button>
        <span className="text--success">Great! Now head to the "Command" tab and send some commands!</span>
      </>
    }
  </>
}
