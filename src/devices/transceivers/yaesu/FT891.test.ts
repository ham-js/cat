import { describe, expect, test } from "@jest/globals";
import { FT891 } from "./FT891";

describe("FT891", () => {
  test("device name", () => expect(FT891.deviceName).toBe("FT-891"))
})
