import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import { useCallback, useState } from "react"
import { Configuration as CommunicationDriverConfiguration, DriverType as CommunicationDriverType, ConfigureCommunicationDriver, DEFAULT_DRIVER_CONFIGURATIONS as DEFAULT_COMMUNICATION_DRIVER_CONFIGURATIONS } from "./ConfigureCommunicationDriver"
import { CP210xDriver } from "../../../src/communication-drivers/browser/web-usb/CP210xDriver"
import { DummyDriver } from "../../../src/communication-drivers/DummyDriver"
import { CommunicationDriver } from "../../../src/communication-drivers/base/CommunicationDriver"
import { ConfigureDeviceDriver } from "./ConfigureDeviceDriver"
import { Configuration as DeviceDriverConfiguration, DEFAULT_DRIVER_CONFIGURATIONS as DEFAULT_DEVICE_DRIVER_CONFIGURATIONS, DriverType as DeviceDriverType } from "./ConfigureDeviceDriver"
import { TransceiverDriver } from "../../../src/device-drivers/transceivers/base/TransceiverDriver"
import { GenericDriver as ICOMGenericDriver } from "../../../src/device-drivers/transceivers/icom/GenericDriver"
import { GenericDriver as KenwoodGenericDriver } from "../../../src/device-drivers/transceivers/kenwood/GenericDriver"
import { GenericDriver as YaesuGenericDriver } from "../../../src/device-drivers/transceivers/yaesu/GenericDriver"
import { SendCommand } from "./SendCommand"
import { ConnectButton } from "./ConnectButton"
import { VirtualDriver } from "../../../src/device-drivers/transceivers/VirtualDriver"

export const Playground = () => {
  const [deviceDriver, setDeviceDriver] = useState<TransceiverDriver>(null)

  const [connecting, setConnecting] = useState(false)

  const [deviceDriverConfiguration, setDeviceDriverConfiguration] = useState<DeviceDriverConfiguration>(DEFAULT_DEVICE_DRIVER_CONFIGURATIONS[DeviceDriverType.Virtual])
  const handleDeviceDriverConfigurationChange = useCallback((configuration: DeviceDriverConfiguration) => setDeviceDriverConfiguration(configuration), [])

  const [communicationDriverConfiguration, setCommunicationDriverConfiguration] = useState<CommunicationDriverConfiguration>(DEFAULT_COMMUNICATION_DRIVER_CONFIGURATIONS[CommunicationDriverType.Dummy])
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
      } else {
        communicationDriver = new DummyDriver()
      }

      let newDeviceDriver: TransceiverDriver
      if (deviceDriverConfiguration.type === DeviceDriverType.ICOMGeneric) {
        newDeviceDriver = new ICOMGenericDriver(communicationDriver, deviceDriverConfiguration.deviceAddress, 0x01)
      } else if (deviceDriverConfiguration.type === DeviceDriverType.KenwoodGeneric) {
        newDeviceDriver = new KenwoodGenericDriver(communicationDriver)
      } else if (deviceDriverConfiguration.type === DeviceDriverType.YaesuGeneric) {
        newDeviceDriver = new YaesuGenericDriver(communicationDriver)
      } else if (deviceDriverConfiguration.type === DeviceDriverType.Virtual) {
        newDeviceDriver = new VirtualDriver(communicationDriver)
      }

      await newDeviceDriver.open({ log: true })
      setDeviceDriver(newDeviceDriver)

      setConnecting(false)
    }

    connect()
  }, [communicationDriverConfiguration, deviceDriverConfiguration, deviceDriver])

  const handleDisconnect = useCallback(() => {
    deviceDriver.close()
    setDeviceDriver(null)
  }, [deviceDriver])

  return <>
    <Tabs>
      <TabItem value="configuration" label={deviceDriver ? "Driver (connected)" : "Driver (disconnected)"}>
        <div className="margin-bottom--md">
          <ConfigureDeviceDriver configuration={deviceDriverConfiguration} disabled={!!deviceDriver} onChange={handleDeviceDriverConfigurationChange} />
        </div>
        <div className="margin-bottom--md">
          <ConfigureCommunicationDriver configuration={communicationDriverConfiguration} deviceDriverConfiguration={deviceDriverConfiguration} disabled={!!deviceDriver} onChange={handleCommunicationDriverConfigurationChange} />
        </div>

        <ConnectButton connected={!!deviceDriver} connecting={connecting} onConnect={handleConnect} onDisconnect={handleDisconnect} />
      </TabItem>
      <TabItem value="commands" label={deviceDriver ? "Commands *" : "Commands"}>
        <SendCommand deviceDriver={deviceDriver} />
      </TabItem>
    </Tabs>
  </>
}
