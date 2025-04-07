import { useCallback, useEffect, useRef, useState } from "react"
import { Device, DeviceEvent } from "@ham-js/cat"
import { Subscription } from "rxjs"
import clsx from "clsx"
import Styles from "./output.module.scss"

interface Props {
  device: Device | null
}

export const Events = ({ device }: Props) => {
  const outputRef = useRef<HTMLUListElement>(null)
  const [events, setEvents] = useState<DeviceEvent[]>([])
  const [subscription, setSubscription] = useState<null | Subscription>(null)

  useEffect(() => {
    if (device) return

    setSubscription(null)
  }, [device])

  const handleToggleSubscription = useCallback(() => {
    if (subscription) {
      subscription.unsubscribe()
      setSubscription(null)
    } else {
      setSubscription(device!.events!.subscribe((event) => {
        setEvents((events) => [...events, event])
      }))
    }
  }, [device, subscription])

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current?.scrollHeight
    })
  }, [events])

  const handleClear = useCallback(() => setEvents([]), [])

  return <>
    <button className="button button--primary margin-bottom--md" disabled={!device?.events} onClick={handleToggleSubscription} type="button">{subscription ? "Unsubscribe" : "Subscribe"}</button>

    <ul className={clsx("margin-bottom--md padding--md", Styles.output)} ref={outputRef}>
      {
        events.map((event) => <li key={event.timestamp.toISOString()}>
          <span className={Styles.timestamp}>{event.timestamp.toISOString()}</span>{' '}
          {JSON.stringify(event)}
        </li>)
      }
    </ul>

    <button className="button button--secondary" onClick={handleClear} type="button">Clear</button>
  </>
}
