import { describe, expect, test } from "@jest/globals";
import { TEST_DRIVER_TYPE, TestDriver } from "../../../test/utils/TestDriver";
import { Device } from "../Device";
import { device } from "./device";
import { z } from "zod";
import { supportedDrivers } from "./supportedDrivers";

@device({
  number: z
    .number()
    .gt(0),
  string: z
    .string()
})
@supportedDrivers([TEST_DRIVER_TYPE])
class ParentDevice extends Device {}

@device({
  number: z
    .number()
    .lt(10),
  string: z
    .string()
    .regex(/abc/)
})
class ChildDevice extends ParentDevice {}

describe("device", () => {
  test("it parses params", () => {
    expect(() => new ParentDevice(new TestDriver(), { number: -1, string: "def" })).toThrow("Number must be greater than 0")
    expect(() => new ParentDevice(new TestDriver(), { number: 1, string: "def" })).not.toThrow()

    expect(() => new ChildDevice(new TestDriver(), { number: -1, string: "abc" })).toThrow("Number must be greater than 0")
    expect(() => new ChildDevice(new TestDriver(), { number: 10, string: "abc" })).toThrow("Number must be less than 10")
    expect(() => new ChildDevice(new TestDriver(), { number: 9, string: "def" })).toThrow("invalid_string")
    expect(() => new ChildDevice(new TestDriver(), { number: 1, string: "abc" })).not.toThrow()
  })

  test("it overwrites the getter for device schema", () => expect(ParentDevice.deviceSchema).toEqual({
    $schema: "http://json-schema.org/draft-07/schema#",
    additionalProperties: false,
    properties: {
      number: {
        exclusiveMinimum: 0,
        type: "number",
      },
      string: {
        type: "string",
      },
    },
    required: [
      "number",
      "string",
    ],
    type: "object",
  }))
})
