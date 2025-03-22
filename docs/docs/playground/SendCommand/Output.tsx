import clsx from "clsx"
import Styles from "./Output.module.scss"
import { useEffect, useRef } from "react"

const getOutputKey = (output: Output, i: number): string => output.commandKey + output.parameters + output.result + i

export interface Output {
  commandKey: string
  parameters: Parameters<typeof JSON.stringify>[0]
  result: Parameters<typeof JSON.stringify>[0]
}

interface Props {
  output: Output[]
}

export const Output = ({ output }: Props) => {
  const outputRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    outputRef.current?.scrollTo({
      top: outputRef.current?.scrollHeight
    })
  }, [output])

  return <>
    <h3>Output</h3>
    <ul className={clsx("padding-vert--sm padding-horiz--md", Styles.output)} ref={outputRef}>
      {
        output.map((output, i) => <li key={getOutputKey(output, i)}>
          <span className="text--bold">{output.commandKey}({output.parameters}):</span> {output.result}
        </li>)
      }
      <li className={Styles.anchor}></li>
    </ul>
  </>
}
