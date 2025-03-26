import { JSONSchema7 } from "json-schema"
import { z } from "zod"
import zodToJsonSchema from "zod-to-json-schema"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const device = <Target extends new (...parameters: any[]) => any, SchemaShape extends z.ZodRawShape>(schemaShape: SchemaShape) => (target: Target) => {
  const deviceSchema = z.object(schemaShape)

  return class extends target {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...parameters: any[]) {
      // unfortunately typescript forces us to do this as there are currently no type safe class mixins
      // https://www.typescriptlang.org/docs/handbook/mixins.html
      // this means we cannot typecheck transform calls in zod schemas, be aware!
      super(parameters[0], deviceSchema.parse(parameters[1]))

    }

    static get deviceSchema(): JSONSchema7 {
      // https://github.com/StefanTerdell/zod-to-json-schema/issues/144
      return zodToJsonSchema(deviceSchema) as JSONSchema7
    }
  }
}
