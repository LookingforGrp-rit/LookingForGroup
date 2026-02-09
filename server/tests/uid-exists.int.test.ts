import { it, expect } from 'vitest';
import uidExistsService from '#services/users/uid-exists.ts';

it('DEBUG: Prints whether uid 1 exists', async () => {
  const result = await uidExistsService(1);
  console.log(result);
  expect(result).toBeDefined();
});
