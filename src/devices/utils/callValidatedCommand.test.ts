import { z } from "zod";
import { CommandFactory } from "../base/types/CommandFactory";
import { callValidatedCommand } from "./callValidatedCommand";
import {describe, expect, test} from '@jest/globals';

const TEST_COMMAND: CommandFactory<{ test: number }> = () => "hi"
TEST_COMMAND.parameterType = z.object({ test: z.number() })

describe("callValidatedCommand", () => {
  test("works when the params parse", () => {
    const params: unknown = { extra: "hi", test: 1 }

    expect(callValidatedCommand(TEST_COMMAND, params)).toBe("hi")
  })

  test("throws the zod error when params don't parse", () => {
    const params: unknown = { test: "abc" }

    expect(() => callValidatedCommand(TEST_COMMAND, params)).toThrowError("Expected number, received string")
  })
})
