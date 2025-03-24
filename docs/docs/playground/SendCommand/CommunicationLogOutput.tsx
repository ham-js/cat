import { ObservedValueOf } from "rxjs"
import { TransceiverDriver } from "../../../../src/device-drivers/transceivers/base/TransceiverDriver"
import { LogDriver } from "../../../../src/communication-drivers/LogDriver"
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import Styles from "./output.module.scss"
import clsx from "clsx"

type Log = ObservedValueOf<LogDriver["log"]>

const getLogPrefix = (type: Log["type"]): string => {
  if (type === "read") return ">"
  if (type === "write") return "<"
  if (type === "open") return "+ open"
  if (type === "close") return "- close"
}

const getFormattedLogData = (log: Log, format: Format): string => {
  if (!("data" in log)) return ""

  if (format === Format.Utf8) {
    const textDecoder = new TextDecoder("utf-8")
    return textDecoder.decode(log.data)
  }

  const plainData = [...log.data]
  if (format === Format.Binary) return plainData.map((byte) => `0b${byte.toString(2).padStart(8, "0")}`).join(" ")
  if (format === Format.Decimal) return plainData.join(" ")
  if (format === Format.Hex) return plainData.map((byte) => `0x${byte.toString(16).padStart(2, "0")}`).join(" ")
}

enum Format {
  Binary = "binary",
  Hex = "hex",
  Decimal = "decimal",
  Utf8 = "utf8"
}

interface Props {
  deviceDriver: TransceiverDriver | null
}

export const CommunicationLogOutput = ({ deviceDriver }: Props) => {
  const [format, setFormat] = useState<Format>(Format.Utf8)
  const [log, setLog] = useState<Log[]>([])

  useEffect(() => {
    if(deviceDriver) setLog([])
  }, [deviceDriver])

  useEffect(() => {
    if (!deviceDriver?.log) return

    const subscription = deviceDriver.log.subscribe((newLog) => {
      setLog((log) => [...log, newLog])
    })

    return () => subscription.unsubscribe()
  }, [deviceDriver])

  const handleFormatChange = useCallback(({ target: { value }}: ChangeEvent<HTMLSelectElement>) => setFormat(value as Format), [])

  const outputRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current?.scrollHeight
    })
  }, [log])

  const handleClear = useCallback(() => setLog([]), [])

  return <>
    <div><label htmlFor="format">Format</label></div>
    <select className="margin-bottom--md" value={format} onChange={handleFormatChange}>
      <option value={Format.Binary}>Binary</option>
      <option value={Format.Decimal}>Decimal</option>
      <option value={Format.Hex}>Hexadecimal</option>
      <option value={Format.Utf8}>Text (UTF-8)</option>
    </select>
    <ul className={clsx("margin-bottom--md padding--md", Styles.output)} ref={outputRef}>
      {
        log.map((log) => <li key={log.timestamp.toISOString()}>
          <span className={Styles.timestamp}>{log.timestamp.toISOString()}</span>{' '}
          {getLogPrefix(log.type)} {getFormattedLogData(log, format)}
        </li>)
      }
    </ul>
    <button className="button button--secondary" onClick={handleClear} type="button">Clear</button>
  </>
}
