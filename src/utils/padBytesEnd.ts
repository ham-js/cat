export const padBytesEnd = (input: Uint8Array, length: number): Uint8Array => input.length >= length ? input : new Uint8Array([...input, ...Array(length - input.length).fill(0)])
