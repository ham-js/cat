import { DriverType } from "../../../drivers"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const equal = (supportedDrivers: DriverType[], otherSupportedDrivers: any): boolean => {
  if (supportedDrivers === otherSupportedDrivers) return true

  const supportedDriversSet = new Set(supportedDrivers)
  const otherSupportedDriversSet = new Set(otherSupportedDrivers)

  return supportedDriversSet.size === otherSupportedDriversSet.size && Array.from(supportedDriversSet).every((supportedDriver) => otherSupportedDriversSet.has(supportedDriver))
}

/**
 *  This decorator allows to define the drivers this device supports. For introspection reasons we use an enum here.
 *  If not used the device supports all available drivers. **Hint:** You can use the convenience arrays of drivers, such as `DeviceAgnosticDriverTypes`.
 *  @param {DriverType[]} supportedDrivers the supported drivers in form of the DriverType associated with them
 *  @returns {object} the decorated class
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supportedDrivers = <This extends new (...parameters: any[]) => any>(supportedDrivers: DriverType[]) => (target: This, context: ClassDecoratorContext<This>) => {
  const uniqueSupportedDrivers = Array.from(new Set(supportedDrivers).values())

  return class DecoratedClass extends target {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...parameters: any[]) {
      super(...parameters)

      // allow subclasses to optionally overwrite the supported drivers
      if (this.constructor !== DecoratedClass && "supportedDrivers" in this.constructor && !equal(uniqueSupportedDrivers, this.constructor.supportedDrivers)) return
      if (!uniqueSupportedDrivers.includes(this.driver.type)) throw new Error(`This device doesn't support the driver ${this.driver.type} (supported drivers: [${uniqueSupportedDrivers.join(", ")}])`)
    }

    static get supportedDrivers(): DriverType[] {
      return uniqueSupportedDrivers
    }
  }
}
