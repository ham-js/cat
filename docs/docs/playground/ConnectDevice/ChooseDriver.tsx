import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Driver, DriverType, DummyDriver } from "@ham-js/cat"
import { ConfigureCP210xDriver } from "./ConfigureCP210xDriver"
import { ConfigureWebSocketDriver } from "./ConfigureWebSocketDriver"

export type DriverFactory = () => Driver | Promise<Driver | undefined> | undefined

const SUPPORTED_DRIVER_TYPES = [
  DriverType.CP210xWebUSBDriver,
  DriverType.DummyDriver,
  DriverType.WebSocketDriver
] as const

const DriverTypeLabels: Record<typeof SUPPORTED_DRIVER_TYPES[number], string> = {
  [DriverType.CP210xWebUSBDriver]: "Silicon Labs CP210x (WebUSB)",
  [DriverType.DummyDriver]: "Dummy Driver",
  [DriverType.WebSocketDriver]: "WebSocket",
}

interface Props {
  disabled: boolean
  driverTypes: DriverType[]
  onDriverFactoryChange: (createDriverFactory: DriverFactory) => void
}

export const ChooseDriver = ({ disabled, driverTypes, onDriverFactoryChange }: Props) => {
  const filteredDriverTypes = useMemo(
    () =>
      driverTypes.filter((driverType) => (SUPPORTED_DRIVER_TYPES as readonly DriverType[]).includes(driverType)),
    [driverTypes]
  ) as Array<typeof SUPPORTED_DRIVER_TYPES[number]>
  const [selectedDriverType, setSelectedDriverType] = useState<typeof SUPPORTED_DRIVER_TYPES[number]>(DriverType.DummyDriver)

  const handleDriverTypeChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLSelectElement>) =>
      setSelectedDriverType(value as typeof selectedDriverType),
    []
  )

  useEffect(() => {
    if (selectedDriverType === DriverType.DummyDriver) onDriverFactoryChange(() => new DummyDriver())
  }, [selectedDriverType, onDriverFactoryChange])

  useEffect(() => {
    if(!filteredDriverTypes.includes(selectedDriverType)) setSelectedDriverType(filteredDriverTypes[0])
  }, [filteredDriverTypes, selectedDriverType])

  return <>
    <div><label htmlFor="driver">Driver</label></div>

    <select className="margin-bottom--md" disabled={disabled} id="driver" onChange={handleDriverTypeChange} value={selectedDriverType}>
      {
        filteredDriverTypes.map((type) => <option key={type} value={type}>
          {DriverTypeLabels[type]}
        </option>)
      }
    </select>

    {selectedDriverType === DriverType.CP210xWebUSBDriver && <ConfigureCP210xDriver disabled={disabled} onDriverFactoryChange={onDriverFactoryChange} />}
    {selectedDriverType === DriverType.WebSocketDriver && <ConfigureWebSocketDriver disabled={disabled} onDriverFactoryChange={onDriverFactoryChange} />}
  </>
}
