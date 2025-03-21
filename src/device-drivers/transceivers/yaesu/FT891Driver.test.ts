import { describe, expect, test } from "@jest/globals";
import { FT891Driver } from "./FT891Driver";

describe("YaesuTransceiverDevice", () => {
  test("device name", () => expect(FT891Driver.deviceName).toBe("FT-891"))
})
