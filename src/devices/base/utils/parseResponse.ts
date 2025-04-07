import { Observable, map, filter, distinctUntilKeyChanged, identity } from "rxjs"

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
