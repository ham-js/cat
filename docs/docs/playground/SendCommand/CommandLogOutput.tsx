import clsx from "clsx"
import Styles from "./output.module.scss"
import { useEffect, useRef } from "react"

const getCommandLogKey = (commandLog: CommandLog, i: number): string => commandLog.commandKey + commandLog.parameters + commandLog.result + i

export interface CommandLog {
  commandKey: string
  parameters: Parameters<typeof JSON.stringify>[0]
  result: Parameters<typeof JSON.stringify>[0]
  timestamp: Date
}

interface Props {
  commandLog: CommandLog[]
}

export const CommandLogOutput = ({ commandLog }: Props) => {
  const outputRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current?.scrollHeight
    })
  }, [commandLog])

  return <ul className={clsx("padding--md", Styles.output)} ref={outputRef}>
    {
      commandLog.map((commandLog, i) => <li key={getCommandLogKey(commandLog, i)}>
        <span className={Styles.timestamp}>{commandLog.timestamp.toISOString()}</span>{" "}
        {commandLog.commandKey}({commandLog.parameters}): {commandLog.result}
      </li>)
    }
  </ul>
}
