import { z } from "zod";

export const oneOf = <T extends z.Primitive>(
  ary: readonly [T, T, ...T[]],
) => z.union([
  z.literal(ary[0]),
  z.literal(ary[1]),
  ...ary.slice(2).map((value) => z.literal(value))
])
