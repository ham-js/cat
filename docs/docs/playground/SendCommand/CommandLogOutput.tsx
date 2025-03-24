import clsx from "clsx"
import Styles from "./output.module.scss"
import { useEffect, useRef } from "react"

const getCommandLogKey = (commandLog: CommandLog, i: number): string => commandLog.commandKey + commandLog.parameters + commandLog.result + i

export interface CommandLog {
  commandKey: string
  error?: string
  parameters: Parameters<typeof JSON.stringify>[0]
  result?: Parameters<typeof JSON.stringify>[0]
  timestamp: Date
}

interface Props {
  commandLog: CommandLog[]
  onClear: () => void
}

export const CommandLogOutput = ({ commandLog, onClear }: Props) => {
  const outputRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current?.scrollHeight
    })
  }, [commandLog])

  return <>
    <ul className={clsx("margin-bottom--md padding--md", Styles.output)} ref={outputRef}>
      {
        commandLog.map((commandLog, i) => <li key={getCommandLogKey(commandLog, i)}>
          <span className={Styles.timestamp}>{commandLog.timestamp.toISOString()}</span>{" "}
          {commandLog.commandKey}({commandLog.parameters}): {commandLog.result} {commandLog.error && <span className="text--danger">{commandLog.error}</span>}
        </li>)
      }
    </ul>
    <button className="button button--secondary" onClick={onClear} type="button">Clear</button>
  </>
}
