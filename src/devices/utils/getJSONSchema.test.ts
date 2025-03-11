import { describe, expect, test } from "@jest/globals";
import { getJSONSchema } from "./getJSONSchema";
import { CommandFactory } from "../base/types/CommandFactory";
import { z } from "zod";

const TEST_COMMAND: CommandFactory<{ test: number }> = () => "hi"
TEST_COMMAND.parameterType = z.object({ test: z.number() })

describe("getJSONSchema", () => {
  test("returns the JSON schema", () => {
    expect(getJSONSchema(TEST_COMMAND)).toEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      additionalProperties: false,
      properties: {
        test: {
          type: "number",
        },
      },
      required: [
        "test",
      ],
      type: "object"
    })
  })
})
