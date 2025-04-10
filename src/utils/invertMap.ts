export const invertMap = <K, V>(input: Map<K, V>): Map<V, K> => new Map(Array.from((input), (entry) => entry.reverse() as [V, K]))
