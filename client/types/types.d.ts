/**
 * Nested modified {@link Partial}
 * @see {@link https://norday.tech/posts/2021/typescript-partial/}
 */
export type Fillable<T> = {
  [attr in keyof T]: T[attr] extends object ? Fillable<T[attr]> : T[attr] | null;
};