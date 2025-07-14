/**
 *  A type safe utility to invert a JavaScript Map.
 *  @param {Map} input The input map to invert
 *  @returns {Map} The inverted map (type-safe)
 */
export const invertMap = <K, V>(input: Map<K, V>): Map<V, K> => new Map(Array.from((input), (entry) => entry.reverse() as [V, K]))
