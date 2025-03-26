import clsx from "clsx"
import Styles from "./output.module.scss"
import { useCallback, useEffect, useRef, useState } from "react"
import { Device, DeviceLog as DeviceLogType } from "@ham-js/cat"

const getLogKey = (commandLog: DeviceLogType, i: number): string => commandLog.command + commandLog.parameter + ("result" in commandLog ? commandLog.result : commandLog.error) + i

interface Props {
  device: Device | null
}

export const DeviceLog = ({ device }: Props) => {
  const [logs, setLogs] = useState<DeviceLogType[]>([])
  const outputRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!device?.deviceLog) return

    const subscription = device.deviceLog.subscribe((log) => setLogs((logs) => [...logs, log]))

    return () => subscription.unsubscribe()
  }, [device])

  const clear = useCallback(() => setLogs([]), [])

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current?.scrollHeight
    })
  }, [])

  useEffect(() => {
    if (device) clear()
  }, [clear, device])

  return <>
    <ul className={clsx("margin-bottom--md padding--md", Styles.output)} ref={outputRef}>
      {
        logs.map((log, i) => <li key={getLogKey(log, i)}>
          <span className={Styles.timestamp}>{log.timestamp.toISOString()}</span>{" "}
          {log.command}({JSON.stringify(log.parameter)}): {'result' in log && log.result} {"error" in log && <span className="text--danger">{JSON.stringify(log.error)}</span>}
        </li>)
      }
    </ul>

    <button className="button button--secondary" onClick={clear} type="button">Clear</button>
  </>
}
