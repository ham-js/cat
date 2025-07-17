import { describe, expect, test } from "@jest/globals";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { oneOf } from "./oneOf";

describe("oneOf", () => {
  test("it returns the correct schema", () => {
    expect(
      zodToJsonSchema(
        oneOf([])
      )
    ).toEqual(
      zodToJsonSchema(
        z.never()
      )
    )

    expect(
      zodToJsonSchema(
        oneOf([1])
      )
    ).toEqual(
      zodToJsonSchema(
        z.literal(1),
      )
    )

    expect(
      zodToJsonSchema(
        oneOf([1,
          2,
          3
        ])
      )
    ).toEqual(
      zodToJsonSchema(
        z.union([
          z.literal(1),
          z.literal(2),
          z.literal(3)
        ])
      )
    )
  })
})
