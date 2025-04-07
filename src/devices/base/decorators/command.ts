import { z } from "zod";
import { Device } from "../Device";
import zodToJsonSchema from "zod-to-json-schema";
import { JSONSchema7 } from "json-schema";

export function command<This extends Device, ReturnType extends Promise<unknown>>():
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: (this: This, parameter?: any) => ReturnType,
    context: ClassMethodDecoratorContext<This>
  ) => typeof target

export function command<This extends Device, SchemaShape extends z.ZodRawShape, ReturnType extends Promise<unknown>>(schemaShape: SchemaShape):
  (
    target: (this: This, parameter: z.infer<z.ZodObject<SchemaShape>>) => ReturnType,
    context: ClassMethodDecoratorContext<This>
  ) => typeof target

export function command<This extends Device, SchemaShape extends z.ZodRawShape, ReturnType extends Promise<unknown>>(schemaShape?: SchemaShape):
  (
    target: (this: This, parameter: z.infer<z.ZodObject<SchemaShape>>) => Promise<Awaited<ReturnType>>,
    context: ClassMethodDecoratorContext<This>
  ) => typeof target
    | (
      (
        target: (this: This) => Promise<Awaited<ReturnType>>,
        context: ClassMethodDecoratorContext<This>
      ) => typeof target
    ) {
  return function (target, context) {
    context.addInitializer(function (this: This) {
      // https://github.com/StefanTerdell/zod-to-json-schema/issues/144
      this["commandSchemas"].set(String(context.name), zodToJsonSchema(z.object(schemaShape ?? {})) as JSONSchema7)
    })

    return async function decoratedFunction(this: This, parameter: Parameters<typeof target>[0]): Promise<Awaited<ReturnType>> {
      const release = await this["mutex"].acquire()

      try {
        const result = await target.call(this, schemaShape ? z.object(schemaShape).parse(parameter) : parameter)

        this.log({
          command: String(context.name),
          parameter,
          result,
          timestamp: new Date()
        })

        return result
      } catch (error) {
        this.log({
          command: String(context.name),
          error: error ?? new Error("Unknown error"),
          parameter,
          timestamp: new Date()
        })

        throw error
      } finally {
        release()
      }
    }
  }
}
