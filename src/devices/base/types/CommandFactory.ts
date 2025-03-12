import { z } from "zod"

export interface CommandFactory<ParameterType> {
  (parameter: ParameterType): string, // all commands are serial commands and as such can be represented as string
  // TODO: constraint this zod schema to keys within ParameterType of the type specified in ParameterType
  parameterType: z.ZodType // a zod type describing the parameter and possible extensions of it
}
