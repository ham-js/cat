import { useCallback, useState } from "react"
import { Configuration as CommunicationDriverConfiguration, DriverType as CommunicationDriverType, ConfigureCommunicationDriver, DEFAULT_DRIVER_CONFIGURATIONS as DEFAULT_COMMUNICATION_DRIVER_CONFIGURATIONS } from "./ConfigureCommunicationDriver"
import { CP210xDriver } from "../../../src/communication-drivers/browser/web-usb/CP210xDriver"
import { CommunicationDriver } from "../../../src/communication-drivers/base/CommunicationDriver"
import { ConfigureDeviceDriver } from "./ConfigureDeviceDriver"
import { Configuration as DeviceDriverConfiguration, DEFAULT_DRIVER_CONFIGURATIONS as DEFAULT_DEVICE_DRIVER_CONFIGURATIONS, DriverType as DeviceDriverType } from "./ConfigureDeviceDriver"
import { TransceiverDriver } from "../../../src/device-drivers/transceivers/base/TransceiverDriver"
import { GenericDriver as ICOMGenericDriver } from "../../../src/device-drivers/transceivers/icom/GenericDriver"
import { GenericDriver as KenwoodGenericDriver } from "../../../src/device-drivers/transceivers/kenwood/GenericDriver"
import { GenericDriver as YaesuGenericDriver } from "../../../src/device-drivers/transceivers/yaesu/GenericDriver"

export const Playground = () => {
  const [deviceDriver, setDeviceDriver] = useState<TransceiverDriver>(null)
  const [connecting, setConnecting] = useState(false)

  const [deviceDriverConfiguration, setDeviceDriverConfiguration] = useState<DeviceDriverConfiguration>(DEFAULT_DEVICE_DRIVER_CONFIGURATIONS[DeviceDriverType.YaesuGeneric])

  const [communicationDriverConfiguration, setCommunicationDriverConfiguration] = useState<CommunicationDriverConfiguration>(DEFAULT_COMMUNICATION_DRIVER_CONFIGURATIONS[CommunicationDriverType.CP210x])
  const handleCommunicationDriverConfigurationChange = useCallback((configuration: CommunicationDriverConfiguration) => setCommunicationDriverConfiguration(configuration), [])

  const handleConnect = useCallback(() => {
    setConnecting(true)

    const connect = async () => {
      if (deviceDriver) {
        deviceDriver.close()
        setDeviceDriver(null)
      }

      let communicationDriver: CommunicationDriver

      if (communicationDriverConfiguration.type === CommunicationDriverType.CP210x) {
        const usbDevice = await navigator.usb.requestDevice({ filters: CP210xDriver.deviceFilters })
        communicationDriver = new CP210xDriver(usbDevice, communicationDriverConfiguration)
      }

      await communicationDriver.open()

      let newDeviceDriver: TransceiverDriver
      if (deviceDriverConfiguration.type === DeviceDriverType.ICOMGeneric) {
        newDeviceDriver = new ICOMGenericDriver(communicationDriver, deviceDriverConfiguration.deviceAddress, 0x01)
      } else if (deviceDriverConfiguration.type === DeviceDriverType.KenwoodGeneric) {
        newDeviceDriver = new KenwoodGenericDriver(communicationDriver)
      } else if (deviceDriverConfiguration.type === DeviceDriverType.YaesuGeneric) {
        newDeviceDriver = new YaesuGenericDriver(communicationDriver)
      }

      await newDeviceDriver.open()
      setDeviceDriver(newDeviceDriver)

      setConnecting(false)
    }

    connect()
  }, [deviceDriver])

  const handleDisconnect = useCallback(() => {
    deviceDriver.close()
    setDeviceDriver(null)
  }, [deviceDriver])

  return <>
    <div className="row">
      <div className="col margin-bottom--lg">
        <ConfigureCommunicationDriver configuration={communicationDriverConfiguration} onChange={handleCommunicationDriverConfigurationChange} />
      </div>
      <div className="col">
        <ConfigureDeviceDriver />
      </div>
    </div>

    <hr />

    {!deviceDriver && <button className="button button--primary" disabled={connecting} onClick={handleConnect} type="button">Connect</button>}
    {deviceDriver && <button className="button button--primary" disabled={connecting} onClick={handleDisconnect} type="button">Disconnect</button>}
  </>
}
