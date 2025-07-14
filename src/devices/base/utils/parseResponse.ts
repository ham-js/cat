import { Observable, map, filter, distinctUntilKeyChanged, identity } from "rxjs"

/**
 *  Parses an input observable into some kind of value, formats it iff it's not
 *  null/undefined, optionally only emits distinct elements and sets a timestamp on its emissions.
 *  This is mostly used for device events, e.g. VFO frequency changes coming from a transceiver "event bus"
 *  which potentially contains different events.
 *  @param {Observable} input an input observable
 *  @param {Function} parser a function which takes an emission from the input
 *  observable and parses it into something the formatter understands or
 *  null/undefined which terminates processing of this event
 *  @param {Function} formatter a function which takes in what the parser returned
 *  and formats it to be something a consumer understands
 *  @param {string} distinctKey an optional key of the object the formatter returned.
 *  If two consecutive emissions have the same key the returned observable will not emit again.
 *  @returns {Observable} an observable which emits parsed and formatted values based on the params
 *  @example
 *  return trxData
 *    .pipe(
 *      parseResponse(
 *        response$,
 *        this.parseTrxEvent, // e.g. reads bytes into an object describing the device state, containing frequency, mode, ...
 *        (trxEvent) => ({ frequency: trxEvent.frequency }),
 *        "frequency"
 *      )
 *    )
 */
export const parseResponse = <ParserResponse, FormatterResponse>(
  input: Observable<string>,
  parser: (response: string) => ParserResponse,
  formatter: (parserResponse: NonNullable<ParserResponse>) => FormatterResponse,
  distinctKey?: keyof FormatterResponse
): Observable<FormatterResponse & {timestamp: Date}> => {
  return input.pipe(
    map(parser),
    filter((value) => value !== undefined && value !== null),
    map(formatter),
    distinctKey ? distinctUntilKeyChanged(distinctKey) : identity,
    map((value) => ({ ...value, timestamp: new Date() }))
  )
}
