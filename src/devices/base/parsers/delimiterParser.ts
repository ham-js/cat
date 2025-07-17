import { buffer, filter, map, mergeAll, Observable, connect, OperatorFunction } from "rxjs";

/**
 *  A utility that groups emissions of a source observable which are delimited by a certain delimiter.
 *  @example
 *  const source = of("F", "A", "14", "350", "000;")
 *  const parsed = delimiterParser(source, ";")
 *  parsed.subscribe(console.log) // "FA14350000;"
 *  @param {Observable} source The source observable
 *  @param {string|number} delimiter The delimiter for which the parser looks
 *  @returns {Observable} A new observable which emits parsed emissions of the source observable
 */
export const delimiterParser = <T extends Uint8Array | string>(source: Observable<T>, delimiter: T extends Uint8Array ? number : string): Observable<T> => source.pipe(
  mergeAll() as OperatorFunction<T, T extends Uint8Array ? number : string>,
  connect((symbolwiseSource) =>
    symbolwiseSource.pipe(
      buffer(
        symbolwiseSource.pipe(
          filter((byte) => byte === delimiter)
        )
      )
    ),
  ),
  filter((symbolArray) => symbolArray.length !== 0), // happens upon completing
  // need to help ts here a little bit as it doesn't determine the type of symbol array based on delimiter correctly
  // and it something along the way makes the output a (T extends Uint8array ? number : string)[] instead of T extends Uint8Array ? number[] : string
  map((symbolArray) => typeof delimiter === "string" ? (symbolArray as string[]).join("") : new Uint8Array(symbolArray as number[])) as OperatorFunction<(T extends Uint8Array ? number : string)[], T>
)
