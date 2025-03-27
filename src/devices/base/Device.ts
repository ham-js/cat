import { Mutex } from "async-mutex"
import { JSONSchema7 } from "json-schema"

import { Observable, share, Subject } from "rxjs"
import { DeviceType } from "./DeviceType"
import { DeviceVendor } from "./DeviceVendor"
import { DriverType } from "../../drivers/base/DriverType"
import { LogDriver } from "../../drivers/LogDriver"
import { Driver } from "../../drivers/base/Driver"

export type DeviceLog = ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
} | {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
}) & {
  command: string,
  parameter: object,
  timestamp: Date
}

export class Device {
  static readonly deviceName: string
  static readonly deviceType: DeviceType
  static readonly deviceVendor: DeviceVendor

  protected _deviceLog: Subject<DeviceLog> | undefined

  static get deviceSchema(): JSONSchema7 {
    return {}
  }

  static get displayName(): string {
    return `${this.deviceVendor} ${this.deviceName}`
  }

  static get supportedDrivers(): DriverType[] {
    return Object.values(DriverType)
  }

  private mutex = new Mutex()
  private commandSchemas = new Map<string, JSONSchema7>()

  public get driverLog(): LogDriver["log"] | undefined {
    return this.driver instanceof LogDriver ? this.driver.log : undefined
  }

  public get deviceLog(): Observable<DeviceLog> | undefined {
    return this._deviceLog?.asObservable().pipe(share())
  }

  constructor(protected driver: Driver, protected parameter: object = {}) {}

  get isOpen(): boolean {
    return this.driver.isOpen
  }

  protected log(log: DeviceLog) {
    this._deviceLog?.next(log)
  }

  async open({ log, logDriver, logDevice }: { log?: boolean, logDriver?: boolean, logDevice?: boolean } = {}): Promise<void> {
    if (log || logDriver) this.startLoggingDriver()
    if (log || logDevice) this.startLoggingDevice()

    await this.driver.open?.()
  }

  async close(): Promise<void> {
    await this.driver.close?.()
    this.stopLoggingDevice()
  }

  protected startLoggingDevice() {
    if (this._deviceLog) return

    this._deviceLog = new Subject<DeviceLog>()
  }

  protected startLoggingDriver() {
    if (this.driverLog) return

    this.driver = new LogDriver(this.driver)
  }

  protected stopLoggingDevice() {
    this._deviceLog?.complete()
    this._deviceLog = undefined
  }

  getCommandSchema(command: string): JSONSchema7 {
    if (!(command in this)) throw new Error(`The command \`${command}\` does not exist on this device`)

    const commandSchema = this.commandSchemas.get(command)

    if (!commandSchema) throw new Error(`Couldn't find a command parameter schema for the command \`${command}\`. Did you forget to declare the command using the @command({}) decorator?`)

    return commandSchema
  }

  getCommands(): string[] {
    return [...this.commandSchemas.keys()]
  }
}
