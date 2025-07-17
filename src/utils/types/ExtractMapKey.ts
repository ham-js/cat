/**
 *  A utility type to extract the key of a Map
 */
export type ExtractMapKey<M extends Map<unknown, unknown>> = M extends Map<infer K, unknown> ? K : never
