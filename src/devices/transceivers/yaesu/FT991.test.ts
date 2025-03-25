import { describe, expect, test } from "@jest/globals";
import { FT991 } from "devices/transceivers/yaesu/FT991";

describe("FT991", () => {
  test("device name", () => expect(FT991.deviceName).toBe("FT-991"))
})
