export const invert = <I extends Record<PropertyKey, PropertyKey>>(input: I): {[V in keyof I as I[V]]: V} =>
  Object.fromEntries(
    Object
      .entries(input)
      .map((entry) => entry.reverse())
  )
