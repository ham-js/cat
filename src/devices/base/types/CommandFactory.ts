import { z } from "zod"

export interface CommandFactory<ParameterType> {
  (parameter: ParameterType): string, // all commands are serial commands and as such can be represented as string
  parameterType: z.ZodType<ParameterType> // a zod type describing the parameter
}
