export const isNonNull = <T>(t: T): t is NonNullable<T> =>
  t !== null && t !== undefined;
