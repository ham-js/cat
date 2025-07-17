import { defer, distinctUntilKeyChanged, from, map, Observable, ObservableInput, ObservedValueOf, repeat } from "rxjs"

/**
 *  Polls an observable factory (usually a function returning a promise)
 *  every n ms and emits values including a timestamp **Note**: The
 *  observable returned by this utility wait for calls to the factory to
 *  return. It is not guaranteed to return a value every n ms. 
 *  @param {Function} observableFactory a function to poll
 *  @param {string} distinctKey a key which needs to change in order for the returned observable to emit
 *  @param {number} interval the minimum amount of milliseconds for which to repeat the call to observableFactory
 *  @returns {Observable} An observable that emits with every finished poll call to observable factory
 *  @example
 *  const $freq = poll(async () => ({ frequency: await getFrequency() }), "frequency")
 *  $freq.subscribe(console.log)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const poll = <R extends ObservableInput<any>>(observableFactory: () => R, distinctKey: keyof ObservedValueOf<R>, interval = 500): Observable<ObservedValueOf<R> & {timestamp: Date}> => from(
  defer(observableFactory).pipe(
    map((value) => ({ ...value, timestamp: new Date() })),
    repeat({ delay: interval })
  )
).pipe(
  distinctUntilKeyChanged(distinctKey)
)
