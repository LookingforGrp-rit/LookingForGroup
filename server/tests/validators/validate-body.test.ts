import type { Request, Response } from 'express';
import { describe, it, expect, vi } from 'vitest';
import { validateBody } from '#middleware/validators/validate-body.ts';

// The assertions for rejected requests live in the expectRejected helper
/* eslint-disable vitest/expect-expect */

// The rules used on the routes that hand the request body to the database as-is
const memberRules = { roleId: 'integer', profileVisibility: ['public', 'private'] } as const;
const socialRules = { url: 'string', alias: 'string', websiteId: 'integer' } as const;

const run = (rules: Parameters<typeof validateBody>[0], body: unknown) => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const next = vi.fn();
  validateBody(rules)({ body } as Request, { status } as unknown as Response, next);
  return { json, status, next };
};

const expectRejected = (result: ReturnType<typeof run>, error: string) => {
  expect(result.next).not.toHaveBeenCalled();
  expect(result.status).toHaveBeenCalledWith(400);
  expect(result.json).toHaveBeenCalledWith({ status: 400, error, data: null });
};

describe('validateBody', () => {
  describe('lets through', () => {
    it.each([
      [
        'a body with every field',
        socialRules,
        { url: 'https://x.com/a', alias: 'x', websiteId: 3 },
      ],
      ['a body with only some of the fields', socialRules, { alias: 'x' }],
      ['an empty body', socialRules, {}],
      ['a request with no body at all', socialRules, undefined],
      ['an allowed enum value', memberRules, { profileVisibility: 'private' }],
      ['a whole number', memberRules, { roleId: 77 }],
    ])('%s', (_description, rules, body) => {
      const { next, status } = run(rules, body);

      expect(next).toHaveBeenCalledOnce();
      expect(status).not.toHaveBeenCalled();
    });
  });

  describe('rejects', () => {
    it('a field that is not on the list, like userId (to move a link to another user)', () => {
      expectRejected(run(socialRules, { alias: 'x', userId: 2 }), 'Invalid fields: ["userId"]');
    });

    it('a project id (to move a link to another project)', () => {
      expectRejected(run(socialRules, { projectId: 99 }), 'Invalid fields: ["projectId"]');
    });

    it('a nested write on a related record (Prisma relation syntax)', () => {
      expectRejected(
        run(memberRules, { users: { update: { accessLevel: 'Administrator' } } }),
        'Invalid fields: ["users"]',
      );
    });

    it('several unknown fields, naming all of them', () => {
      expectRejected(
        run(memberRules, { users: {}, projects: {}, roleId: 1 }),
        'Invalid fields: ["users","projects"]',
      );
    });

    it("Prisma's { set } syntax in place of a plain value", () => {
      expectRejected(run(socialRules, { alias: { set: 'x' } }), 'Invalid value for alias');
    });

    it('an operator object in place of a number', () => {
      expectRejected(run(memberRules, { roleId: { gt: 0 } }), 'Invalid value for roleId');
    });

    it.each([
      ['text where a number belongs', { roleId: '77' }, 'roleId'],
      ['a decimal where a whole number belongs', { roleId: 1.5 }, 'roleId'],
      ['null', { roleId: null }, 'roleId'],
      [
        'a value that is not one of the allowed ones',
        { profileVisibility: 'admin' },
        'profileVisibility',
      ],
      ['a number where text belongs', { alias: 5 }, 'alias'],
    ])('%s', (_description, body, field) => {
      expectRejected(run({ ...memberRules, ...socialRules }, body), `Invalid value for ${field}`);
    });

    it.each([
      ['a list', [{ alias: 'x' }]],
      ['text', 'alias'],
      ['a number', 5],
    ])('a body that is %s instead of an object', (_description, body) => {
      expectRejected(run(socialRules, body), 'The request body must be an object');
    });

    it('a __proto__ key', () => {
      expectRejected(
        run(socialRules, JSON.parse('{"__proto__": {"admin": true}}')),
        'Invalid fields: ["__proto__"]',
      );
    });
  });
});
