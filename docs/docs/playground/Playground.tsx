import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import { useState } from "react"
import { SendCommand } from "./SendCommand"
import { Device } from "@ham-js/cat"
import { ConnectDevice } from "./ConnectDevice"
import { Events } from "./Events"

export const Playground = () => {
  const [device, setDevice] = useState<Device | null>(null)

  return <>
    <Tabs>
      <TabItem value="configuration" label={device ? "Configuration (connected)" : "Configuration (disconnected)"}>
        <ConnectDevice onChange={setDevice} device={device} />
      </TabItem>
      <TabItem value="commands" label={device ? "Commands *" : "Commands"}>
        <SendCommand device={device} />
      </TabItem>
      <TabItem value="events" label={device ? "Events *" : "Events"}>
        <Events device={device} />
      </TabItem>
    </Tabs>
  </>
}
