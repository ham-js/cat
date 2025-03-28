import { DriverType } from "../../../drivers"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const equal = (supportedDrivers: DriverType[], otherSupportedDrivers: any): boolean => {
  if (supportedDrivers === otherSupportedDrivers) return true
  if (!Array.isArray(otherSupportedDrivers)) return false

  const supportedDriversSet = new Set(supportedDrivers)
  const otherSupportedDriversSet = new Set(otherSupportedDrivers)

  return supportedDriversSet.size === otherSupportedDriversSet.size && Array.from(supportedDriversSet).every((supportedDriver) => otherSupportedDriversSet.has(supportedDriver))
}

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
