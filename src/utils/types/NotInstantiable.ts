export type NotInstantiable<T> = Omit<T, "()">
