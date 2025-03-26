import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { DriverFactory } from "./ChooseDriver"
import { WebSocketDriver } from "@ham-js/cat"

interface Props {
  disabled: boolean
  onDriverFactoryChange: (createDriverFactory: DriverFactory) => void
}

export const ConfigureWebSocketDriver = ({ disabled, onDriverFactoryChange }: Props) => {
  const [url, setUrl] = useState("")

  const handleURLChange = useCallback(({ target: { value }}: ChangeEvent<HTMLInputElement>) => setUrl(value), [])

  useEffect(() => {
    onDriverFactoryChange(() => {
      if (!url) return

      const webSocket = new WebSocket(url)

      return new WebSocketDriver(webSocket)
    })
  }, [url, onDriverFactoryChange])

  return <div>
    <div><label htmlFor="url">URL</label></div>

    <input disabled={disabled} id="url" onChange={handleURLChange} value={url}>
    </input>
  </div>
}
