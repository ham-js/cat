import { DriverType } from "drivers/base/DriverType"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supportedDrivers = <This extends new (...parameters: any[]) => any>(supportedDrivers: DriverType[]) => (target: This, context: ClassDecoratorContext<This>) => {
  return class extends target {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...parameters: any[]) {
      super(...parameters)

      if (!supportedDrivers.includes(this.driver.type)) throw new Error(`This device doesn't support the driver \`${this.driver.type}\``)
    }

    static get supportedDrivers(): DriverType[] {
      return supportedDrivers
    }
  }
}
