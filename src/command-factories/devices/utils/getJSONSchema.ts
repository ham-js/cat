import zodToJsonSchema from "zod-to-json-schema";
import { CommandFactory } from "../types/CommandFactory";

export const getJSONSchema = <P>(command: CommandFactory<P>) => zodToJsonSchema(command.parameterType)
