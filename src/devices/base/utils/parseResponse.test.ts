import { describe, expect, jest, test } from "@jest/globals";
import { firstValueFrom, of, toArray } from "rxjs";
import { parseResponse } from "./parseResponse";

describe("parseResponse", () => {
  test("it parses values", async () => {
    jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00"))

    const input = of("NO", "TEST", "TEST")

    const result = firstValueFrom(
      parseResponse(
        input,
        (response) => response === "TEST" ? true : null,
        (responseIsTest) => ({ responseIsTest, someRandomValue: new Date() }),
        "responseIsTest"
      ).pipe(
        toArray()
      )
    )

    await expect(result).resolves.toEqual([{
      responseIsTest: true,
      someRandomValue: expect.any(Date),
      timestamp: new Date("1992-01-22T13:00:00")
    }])
  })
})
