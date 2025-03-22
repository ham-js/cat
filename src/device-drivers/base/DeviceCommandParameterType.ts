import { DeviceDriver } from "./DeviceDriver"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DeviceDriverCommandParameterType<D extends DeviceDriver<any>, K extends keyof D["_commands"]> = D extends DeviceDriver<infer C> ? Parameters<C[K]>[0] : never
