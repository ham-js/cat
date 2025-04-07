import { describe, expect, jest, test } from "@jest/globals";
import { poll } from "./poll";
import { firstValueFrom, take, toArray } from "rxjs";

describe("poll", () => {
  test("polls based on the interval", async () => {
    jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

    let count = 0

    const results = firstValueFrom(
      // we construct a test scenario where the first emission takes 250 ms, second emission is instant (but skips the stack)
      poll(() => new Promise<{ value: string }>((resolve) => {
        const wasCount = count

        setTimeout(() => resolve({ value: `test${wasCount}` }), (1 - count) * 250)

        count++
      }), "value").pipe(
        take(2),
        toArray()
      )
    )

    await jest.advanceTimersToNextTimerAsync(3)

    // there are multiple assertions here:
    // * the order is important, if we just polled every n seconds we would receive test1 first
    // * the timestamp is added once the parser received a value
    await expect(results).resolves.toEqual([
      { timestamp: new Date("1992-01-22T13:00:00.250Z"), value: "test0", },
      { timestamp: new Date("1992-01-22T13:00:00.751Z"), value: "test1", }, // first emission took 250 ms, polling interval is + 500 ms, then next emission took 0 ms (but we need to advance the timer by 1 ms for it to be triggered)
    ])
  })

  test("it only emits when the value of the given key changed", async () => {
    jest.useFakeTimers().setSystemTime(new Date("1992-01-22T13:00:00Z"))

    let count = 0

    const result: {timestamp: Date, value: string}[] = []

    const subscription = poll(() => new Promise<{ value: string }>((resolve) => {
      resolve({ value: "test" })

      count++
    }), "value").subscribe((value) => result.push(value))

    await jest.advanceTimersByTimeAsync(5000)
    subscription.unsubscribe()

    expect(count).toBe(11) // we start at t = 0 and the last poll happens at t = 5000, so we poll 11 times
    expect(result).toEqual([{ // but we will only receive the first value
      timestamp: new Date("1992-01-22T13:00:00.000Z"),
      value: "test"
    }])
  })
})
