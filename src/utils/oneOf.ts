import { z } from "zod";

export const oneOf = <T extends z.Primitive>(
  ary: readonly T[],
) => {
  if (ary.length === 0) return z.never()
  if (ary.length === 1) return z.literal(ary[0])

  return z.union([
    z.literal(ary[0]),
    z.literal(ary[1]),
    ...ary.slice(2).map((value) => z.literal(value))
  ])
}
