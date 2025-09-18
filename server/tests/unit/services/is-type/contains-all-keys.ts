import { expect, test } from 'vitest';

export function containsAllKeys<T>(typeName: string, obj: T, keys: (keyof T)[]): void {
  test(`Object must contain all properties in ${typeName} type`, () => {
    expect(obj).toEqual(expect.any(Object));
    for (const key of keys) {
      expect(obj).toHaveProperty(key as string);
    }
  });
}
