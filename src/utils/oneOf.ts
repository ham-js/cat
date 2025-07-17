import { z } from "zod";

/**
 *  a zod utility to validate inclusion of a value in an array
 *  @param {Array} ary The array in which the valud should be included.
 *  @returns {z.Schema} A zod schema describing the validation
 */
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
