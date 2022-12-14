export type Mutable<T> =
  T extends (undefined | null | boolean | string | number) ? T :
  T extends Array<infer U> ? U[] :
  T extends Iterable<infer U> ? Iterable<U> :
  T extends Set<infer U> ? Set<U> :
  T extends Map<infer K, infer V> ? Map<K, V> :
  { -readonly [K in keyof T]: Mutable<T[K]> };
