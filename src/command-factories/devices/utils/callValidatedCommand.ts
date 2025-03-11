import { CommandFactory } from "../types/CommandFactory";

export const callValidatedCommand = <P>(command: CommandFactory<P>, params: unknown): ReturnType<typeof command> => command(command.parameterType.parse(params))
