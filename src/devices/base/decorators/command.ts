import { z } from "zod";
import { Device } from "../Device";
import zodToJsonSchema from "zod-to-json-schema";
import { JSONSchema7 } from "json-schema";

export const command = <This extends Device, ParameterType extends z.ZodRawShape, ReturnType extends Promise<unknown>>(parameterType: ParameterType) => {
  return function(target: (parameter: z.infer<z.ZodObject<ParameterType>>) => ReturnType, context: ClassMethodDecoratorContext<This>) {
    context.addInitializer(function(this: This) {
      // https://github.com/StefanTerdell/zod-to-json-schema/issues/144
      this["commandSchemas"].set(String(context.name), zodToJsonSchema(z.object(parameterType)) as JSONSchema7)
    })

    async function decoratedFunction(this: This, parameter: Parameters<typeof target>[0]): Promise<Awaited<ReturnType>> {
      const release = await this["mutex"].acquire()

      try {
        const result = await target.call(this, z.object(parameterType).parse(parameter))

        this.log({
          command: String(context.name),
          parameter,
          result,
          timestamp: new Date()
        })

        return result
      } finally {
        release()
      }
    }
    
    return decoratedFunction
  }
}
