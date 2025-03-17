import { describe, expect, test } from "@jest/globals";

import { FT991 } from "./FT991"

describe("YaesuTransceiverDevice", () => {
  test("device name", () => expect(FT991.deviceName).toBe("FT-991"))
})
