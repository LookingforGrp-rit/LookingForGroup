import { expect, it } from 'vitest';
import { getUserProjectsService } from '#services/users/get-user-proj.ts';

it('DEBUG: prints all projects NO MOCKS!', async () => {
  const result = await getUserProjectsService(42);

  //console.log(result);
  expect(result.length).toBeGreaterThan(0);
  expect(result).toBeDefined();
});
