export type NonInstantiable<T> = Omit<T, "()">
