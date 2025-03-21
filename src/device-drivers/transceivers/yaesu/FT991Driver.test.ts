import { describe, expect, test } from "@jest/globals";

import { FT991Driver } from "./FT991Driver"

describe("YaesuTransceiverDevice", () => {
  test("device name", () => expect(FT991Driver.deviceName).toBe("FT-991"))
})
