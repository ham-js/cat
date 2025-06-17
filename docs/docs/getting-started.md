import CodeBlock from "@theme/CodeBlock"
import SerialPortExampleSource from "!!raw-loader!../../examples/serialPort.ts"
import TRXComponentSource from "!!raw-loader!./TRXComponent"
import { TRXComponent } from "./TRXComponent"

# Getting Started

## Installation

```bash
yarn add @ham-js/cat
npm install @ham-js/cat
```

The same package can be used in the browser or with nodejs.

## NodeJS with [SerialPort](http://serialport.io/)

Also have a look at the [`/examples`](https://github.com/ham-js/cat/tree/main/examples) folder.

<CodeBlock language="typescript">{SerialPortExampleSource}</CodeBlock>

## React with [WebSerial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)

Also have a look at the [source code of the playground](https://github.com/ham-js/cat/tree/main/docs/docs/playground).

<CodeBlock language="typescript">{TRXComponentSource}</CodeBlock>

<div className="reactExample">
  <TRXComponent />
</div>

Refer to the [API docs](/cat/docs/api) for further drivers.

## Logging

```typescript
// log low-level communication
await device.open({ logDriver: true })
device.driverLog.subscribe(console.log)

// log commands send to device and their result
await device.open({ logDevice: true })
device.deviceLog.subscribe(console.log)

// or log both at once
await device.open({ log: true })
```
