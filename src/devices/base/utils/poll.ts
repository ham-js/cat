import { defer, distinctUntilKeyChanged, from, map, Observable, ObservableInput, ObservedValueOf, repeat } from "rxjs"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const poll = <R extends ObservableInput<any>>(observableFactory: () => R, distinctKey: keyof ObservedValueOf<R>, interval = 500): Observable<ObservedValueOf<R> & {timestamp: Date}> => from(
  defer(observableFactory).pipe(
    map((value) => ({ ...value, timestamp: new Date() })),
    repeat({ delay: interval })
  )
).pipe(
  distinctUntilKeyChanged(distinctKey)
)
