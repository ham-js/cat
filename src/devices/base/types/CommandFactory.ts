import { z } from "zod"

/**
 * A function which receives a parameter of type `ParameterType` and returns a
 * CAT command.  It includes a ZodType to allow runtime introspection and
 * validation of the parameter. Some types simply cannot be properly narrowed
 * with TypeScript, e.g. the range of a frequency supported by a transceiver.
 * @private
 */
export interface CommandFactory<ParameterType extends object> {
  /**
   * The function which receives an object as first parameter and returns the
   * CAT command as string.
   * @returns {string} the CAT command configured by `parameter`
   */
  (parameter: ParameterType): string

  /**
   * This is a zod type describing the shape of the parameter. Properties can
   * only be extended by extraneous optional properties or existing properties
   * can be narrowed down at runtime. If you use a native enum in this type,
   * please use string keys, so the values in the JSON schema make sense.
   * @private
   */
  parameterType: z.ZodType<ParameterType>
}
