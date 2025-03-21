import { GenericDriver } from "./GenericDriver";
import { FT891Driver } from "./FT891Driver";
import { FT991Driver } from "./FT991Driver";

export const YaesuTransceiverDrivers: typeof GenericDriver[] = [
  GenericDriver,
  FT891Driver,
  FT991Driver
]
