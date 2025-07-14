import { Mutex } from "async-mutex"
import { JSONSchema7 } from "json-schema"

import { firstValueFrom, map, filter, EMPTY, Observable, share, Subject, timeout } from "rxjs"
import { DeviceType } from "./DeviceType"
import { DeviceVendor } from "./DeviceVendor"
import { DriverType } from "../../drivers/base/DriverType"
import { LogDriver } from "../../drivers/LogDriver"
import { Driver } from "../../drivers/base/Driver"
import { DeviceLog } from "./DeviceLog"
import { DeviceEvent } from "./DeviceEvent"

/**
 *  The base class for all devices, holds some information about the device and
 *  provides basic functionality
 */
export class Device<DataType extends string | Uint8Array = never> {
  static readonly deviceName: string
  static readonly deviceType: DeviceType
  static readonly deviceVendor: DeviceVendor

  /**
   * The response timeout used by `readResponse`
   */
  responseTimeout = 1000

  /**
   * The optional device data from which `readResponse` reads after writing a
   * command to the driver.
   */
  protected data: Observable<DataType> = EMPTY
  /**
   * The optional events coming from a device (such as Yaesu TRX which have
   * "Auto Information" which automatically sends data to the computer when
   * anything changes).
   */
  readonly events: Observable<DeviceEvent> = EMPTY

  protected _deviceLog: Subject<DeviceLog> | undefined

  /**
   * The optional device schema of the device. This is used for devices which
   * need additional parameters to be instantiated, such as the
   * controller/device address in the case of ICOM devices.
   * @returns {object} The JSON schema describing the second parameter to the
   * constructor.
   */
  static get deviceSchema(): JSONSchema7 {
    return {}
  }

  /**
   * Convenience method to get the display name of the device.
   * @returns {string} the concatenated device vendor and device name
   */
  static get displayName(): string {
    return `${this.deviceVendor} ${this.deviceName}`
  }

  /**
   *  Get the supported driver (types) of the device, default is all members of DriverType.
   *  @returns {DriverType[]} An array of driver types this device supports
   *  (trying to instantiate a device with a non-supported driver results in an
   *  error).
   */
  static get supportedDrivers(): DriverType[] {
    return Object.values(DriverType)
  }

  private mutex = new Mutex()
  private commandSchemas = new Map<string, JSONSchema7>()

  /**
   *  When a device is opened with `logDriver: true` this returns the driver log.
   *  @returns {Observable|undefined} the driver log which contains all
   *  messages written through the driver to a real physical device
   */
  public get driverLog(): LogDriver["log"] | undefined {
    return this.driver instanceof LogDriver ? this.driver.log : undefined
  }

  /**
   *  When a device is opened with `logDevice: true` this returns the device log.
   *  @returns {Observable|undefined} the device log which contains all
   *  calls to commands and their parameters and timestamps.
   */
  public get deviceLog(): Observable<DeviceLog> | undefined {
    return this._deviceLog?.asObservable().pipe(share())
  }

  /**
   *  The constructor for devices, which always (also in subclasses) takes this
   *  shape to allow for introspection and type-safety at runtime and
   *  buildtime.
   *  @param {Driver} driver The driver this device uses to communicate with a real physical device.
   *  @param {object} parameter Optional additional parameters this device
   *  needs to function properly, such as target device addresses etc.. This is described using the
   *  `@device` decorater and can be introspected at runtime using `deviceSchema`.
   */
  constructor(protected driver: Driver, protected parameter: object = {}) {}

  /**
   *  Whether the device is open. By default this delegates to the driver.
   *  @returns {boolean} Whether this device is open for calling commands.
   */
  get isOpen(): boolean {
    return this.driver.isOpen
  }

  protected log(log: DeviceLog) {
    this._deviceLog?.next(log)
  }

  /**
   * Open the device for executing commands, reading data and subscribing to
   * events. By defaults this delegates to the driver and handles setting up
   * logging.
   * @param {object} config the open configuration
   * @param {boolean} config.logDriver Whether the device should log driver calls
   * @param {boolean} config.logDevice Whether the device should log command calls
   * @param {boolean} config.log Whether the device should log both
   */
  async open({ log, logDriver, logDevice }: { log?: boolean, logDriver?: boolean, logDevice?: boolean } = {}): Promise<void> {
    if (log || logDriver) this.startLoggingDriver()
    if (log || logDevice) this.startLoggingDevice()

    await this.driver.open?.()
  }

  /**
   * Close the device for executing commands, reading data and subscribing to events.
   */
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

  /**
   *  Get the command schema for a given command
   *  @param {string} command the key of a command method
   *  @returns {object} The JSON schema describing the object parameter for that command
   */
  getCommandSchema(command: string): JSONSchema7 {
    if (!(command in this)) throw new Error(`The command \`${command}\` does not exist on this device`)

    const commandSchema = this.commandSchemas.get(command)

    if (!commandSchema) throw new Error(`Couldn't find a command parameter schema for the command \`${command}\`. Did you forget to declare the command using the @command({}) decorator?`)

    return commandSchema
  }

  /**
   *  Get all keys of implemented commands.
   *  @returns {string[]} An array containing all the keys of commands this device implements.
   */
  getCommands(): string[] {
    return [...this.commandSchemas.keys()]
  }

  /**
   *  Convenience method to write a command and wait for a specific response
   *  from the real physical device. Handles timeouts as well. Needs the `data`
   *  property and `DataType` type parameter to be defined.
   *  @param {Uint8Array|string} command the command to write
   *  @param {Function} mapFn A function which is called with responses after
   *  the command was written. Should return null or undefined for responses
   *  that are not of interest.
   *  @param {number} responseTimeout An optional response timeout in ms,
   *  overrides the `responseTimeout` defined on the device.
   *  @returns {Promise} A promise that resolves with the first value the mapFn
   *  returns that is not null/undefined and rejects when a timeout happens.
   */
  protected async readResponse<MapResult>(command: DataType, mapFn: (response: DataType) => MapResult, responseTimeout = this.responseTimeout): Promise<NonNullable<MapResult>> {
    if (this.data === EMPTY) throw new Error("In order to use `readResponse` you need to implement the `data` property")

    const value = firstValueFrom(
      this.data
        .pipe(
          map(mapFn),
          filter((value) => value !== null && value !== undefined),
          timeout(responseTimeout)
        )
    )

    if (typeof command === "string") await this.driver.writeString(command)
    else await this.driver.write(command)

    return value
  }
}
